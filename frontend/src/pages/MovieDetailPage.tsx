import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { fetchMovie } from "@/services/movieService";
import { fetchFunciones } from "@/services/reservationService";
import type { Movie } from "@/types/movies";
import type { Funcion } from "@/types/reservations";
import { Clock, MapPin } from "lucide-react";

function formatPrice(price: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(price));
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return "Hoy";
  if (d.toDateString() === tomorrow.toDateString()) return "Manana";

  return d.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function groupByDate(funciones: Funcion[]): Map<string, Funcion[]> {
  const groups = new Map<string, Funcion[]>();
  for (const f of funciones) {
    const day = new Date(f.start_time).toDateString();
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(f);
  }
  return groups;
}

function groupByCine(funciones: Funcion[]): Map<string, Funcion[]> {
  const groups = new Map<string, Funcion[]>();
  for (const f of funciones) {
    const cine = f.cine_name || "Sin lugar";
    if (!groups.has(cine)) groups.set(cine, []);
    groups.get(cine)!.push(f);
  }
  return groups;
}

function groupBySalaNumber(funciones: Funcion[]): Map<number, Funcion[]> {
  const groups = new Map<number, Funcion[]>();
  for (const f of funciones) {
    const n = f.sala_number ?? 0;
    if (!groups.has(n)) groups.set(n, []);
    groups.get(n)!.push(f);
  }
  return groups;
}

function buildFormatTabs(funciones: Funcion[]): { label: string; funciones: Funcion[] }[] {
  const groups = new Map<string, Funcion[]>();
  const sinFormato: Funcion[] = [];
  for (const f of funciones) {
    if (f.formats && f.formats.length > 0) {
      for (const fmt of f.formats) {
        if (!groups.has(fmt.name)) groups.set(fmt.name, []);
        groups.get(fmt.name)!.push(f);
      }
    } else {
      sinFormato.push(f);
    }
  }
  const tabs = Array.from(groups.entries()).map(([label, fs]) => ({
    label,
    funciones: fs,
  }));
  tabs.sort((a, b) => a.label.localeCompare(b.label));
  if (sinFormato.length > 0) {
    tabs.push({ label: "Sin formato", funciones: sinFormato });
  }
  return tabs;
}

function buildFranjaTabs(funciones: Funcion[]): { label: string; funciones: Funcion[] }[] {
  const groups = new Map<string, Funcion[]>();
  for (const f of funciones) {
    const franja = f.franja || "Sin franja";
    if (!groups.has(franja)) groups.set(franja, []);
    groups.get(franja)!.push(f);
  }
  const tabs = Array.from(groups.entries()).map(([label, fs]) => ({
    label,
    funciones: fs,
  }));
  tabs.sort((a, b) => {
    if (a.label === "Sin franja") return 1;
    if (b.label === "Sin franja") return -1;
    const aMin = Math.min(
      ...a.funciones.map((f) => new Date(f.start_time).getTime()),
    );
    const bMin = Math.min(
      ...b.funciones.map((f) => new Date(f.start_time).getTime()),
    );
    return aMin - bMin;
  });
  return tabs;
}

function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: movie, isLoading: movieLoading } = useQuery<Movie>({
    queryKey: ["movie", id],
    queryFn: () => fetchMovie(Number(id)),
    enabled: !!id,
    staleTime: 0,
  });

  const { data: funcionesData, isLoading: funcionesLoading } = useQuery({
    queryKey: ["funciones", id],
    queryFn: () => fetchFunciones(Number(id)),
    enabled: !!id,
    staleTime: 0,
  });

  const funciones = funcionesData?.results ?? [];

  const franjaTabs = useMemo(() => buildFranjaTabs(funciones), [funciones]);

  const [activeFranja, setActiveFranja] = useState(0);
  const [activeFormat, setActiveFormat] = useState(0);

  const franjaFunciones = franjaTabs[activeFranja]?.funciones ?? [];

  const formatTabs = useMemo(
    () => buildFormatTabs(franjaFunciones),
    [franjaFunciones],
  );

  const formatFunciones = formatTabs[activeFormat]?.funciones ?? [];

  const groupedByCine = useMemo(
    () => groupByCine(formatFunciones),
    [formatFunciones],
  );

  if (movieLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-800 rounded" />
          <div className="h-96 bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 text-lg">Pelicula no encontrada.</p>
      </div>
    );
  }

  const dc = movie.display_config;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <div className="aspect-[2/3] bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden">
              {movie.poster ? (
                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 space-y-3">
              {(!dc || dc.show_director) && movie.director_name && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Director</p>
                  <p className="text-gray-300 text-sm">{movie.director_name}</p>
                </div>
              )}
              {(!dc || dc.show_author) && movie.author_name && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Autor</p>
                  <p className="text-gray-300 text-sm">{movie.author_name}</p>
                </div>
              )}
              {(!dc || dc.show_actor) && movie.actor_name && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Actor</p>
                  <p className="text-gray-300 text-sm">{movie.actor_name}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
              {(!dc || dc.show_genre) && movie.genre_name && (
                <span className="px-2.5 py-1 bg-red-600/10 text-red-400 border border-red-600/30 rounded-full text-xs font-medium">
                  {movie.genre_name}
                </span>
              )}
              {(!dc || dc.show_duration) && (
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {movie.duration_minutes} min
                </span>
              )}
              {(!dc || dc.show_release_year) && (
                <span className="text-gray-400">{movie.release_year}</span>
              )}
              {(!dc || dc.show_price) && (
                <span className="text-red-400 font-semibold">{formatPrice(movie.price)}</span>
              )}
            </div>
          </div>

          {(!dc || dc.show_description) && (
            <p className="text-gray-300 leading-relaxed">{movie.description}</p>
          )}

          <div className="border-t border-gray-700/50 pt-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-400" />
              Horarios disponibles
            </h2>

            {funcionesLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-5 w-24 bg-gray-800 rounded animate-pulse" />
                    <div className="flex gap-2 flex-wrap">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-10 w-24 bg-gray-800 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : franjaTabs.length > 0 ? (
              <>
                {franjaTabs.length > 1 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {franjaTabs.map((tab, idx) => (
                      <button
                        key={tab.label}
                        onClick={() => {
                          setActiveFranja(idx);
                          setActiveFormat(0);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          idx === activeFranja
                            ? "bg-red-600 text-white"
                            : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}

                {formatTabs.length > 1 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {formatTabs.map((tab, idx) => (
                      <button
                        key={tab.label}
                        onClick={() => setActiveFormat(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          idx === activeFormat
                            ? "bg-red-600 text-white"
                            : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                  {Array.from(groupedByCine.entries()).map(
                    ([cine, cineFunciones]) => (
                      <div
                        key={cine}
                        className="bg-gray-800 border border-gray-700/50 rounded-xl p-5 flex-1 min-w-[280px]"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                          <h3 className="text-white font-semibold text-sm">
                            {cine}
                          </h3>
                        </div>
                        <div className="space-y-4">
                          {Array.from(
                            groupBySalaNumber(cineFunciones).entries(),
                          )
                            .sort(([a], [b]) => a - b)
                            .map(([salaNumber, salaFunciones]) => (
                              <div key={salaNumber}>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                  Sala {salaNumber}
                                </p>
                                <div className="space-y-3">
                                  {Array.from(
                                    groupByDate(salaFunciones).entries(),
                                  ).map(([dayKey, dayFunciones]) => (
                                    <div key={dayKey}>
                                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                                        {formatDate(dayFunciones[0].start_time)}
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {dayFunciones
                                          .sort(
                                            (a, b) =>
                                              new Date(a.start_time).getTime() -
                                              new Date(b.start_time).getTime(),
                                          )
                                          .map((f) => (
                                            <button
                                              key={f.id}
                                              onClick={() =>
                                                navigate(
                                                  `/movies/${id}/funcion/${f.id}/seats`,
                                                )
                                              }
                                              disabled={f.available_seats === 0}
                                              className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                                                f.available_seats === 0
                                                  ? "bg-gray-700/30 text-gray-600 cursor-not-allowed border-transparent"
                                                  : "bg-gray-700/50 text-gray-200 hover:bg-red-600 hover:text-white border-gray-600/30 hover:border-red-600"
                                              }`}
                                            >
                                              <span className="block font-medium">
                                                {formatTime(f.start_time)}
                                              </span>
                                              <span
                                                className={`block text-xs ${
                                                  f.available_seats === 0
                                                    ? "text-gray-600"
                                                    : "text-gray-400"
                                                }`}
                                              >
                                                {f.available_seats} asientos
                                              </span>
                                            </button>
                                          ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-gray-800/30 border border-gray-700/30 rounded-xl">
                <Clock className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No hay horarios disponibles por ahora.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailPage;
