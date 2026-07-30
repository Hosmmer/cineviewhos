import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFuncion,
  updateFuncion,
  fetchAdminFuncion,
  fetchAdminSalas,
  fetchAdminFormats,
} from "@/services/reservationService";
import { fetchMovies } from "@/services/movieService";
import type { MovieList } from "@/types/movies";
import type { SalaDetail } from "@/types/reservations";

function AdminFuncionForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;
  const [movieId, setMovieId] = useState(0);
  const [salaId, setSalaId] = useState(0);
  const [startTime, setStartTime] = useState("");
  const [formatIds, setFormatIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: moviesData } = useQuery({
    queryKey: ["admin-movies-dropdown"],
    queryFn: () => fetchMovies(),
  });

  const { data: salasData } = useQuery({
    queryKey: ["admin-salas-dropdown"],
    queryFn: () => fetchAdminSalas(),
  });

  const { data: formatsData } = useQuery({
    queryKey: ["admin-formats-dropdown"],
    queryFn: () => fetchAdminFormats(),
  });

  const { data: funcion } = useQuery({
    queryKey: ["admin-funcion", id],
    queryFn: () => fetchAdminFuncion(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (funcion) {
      setMovieId(funcion.movie);
      setSalaId(funcion.sala);
      setStartTime(funcion.start_time.slice(0, 16));
      if (funcion.formats) {
        setFormatIds(funcion.formats.map((f) => f.id));
      }
    }
  }, [funcion]);

  const movies = moviesData?.results ?? [];
  const salas = salasData?.results ?? [];
  const formats = formatsData?.results ?? [];

  const toggleFormat = (formatId: number) => {
    setFormatIds((prev) =>
      prev.includes(formatId) ? prev.filter((id) => id !== formatId) : [...prev, formatId],
    );
  };

  const mutation = useMutation({
    mutationFn: () => {
      const data = {
        movie: movieId,
        sala: salaId,
        start_time: new Date(startTime).toISOString(),
        format_ids: formatIds,
      };
      return isEdit ? updateFuncion(Number(id), data) : createFuncion(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-funciones"] });
      queryClient.invalidateQueries({ queryKey: ["admin-funcion", id] });
      queryClient.invalidateQueries({ queryKey: ["funciones"] });
      navigate("/reservations/showtimes");
    },
    onError: (err: any) => {
      setError(err?.response?.data?.detail ?? "Error al guardar.");
    },
  });

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-white mb-6">
        {isEdit ? "Editar Funcion" : "Nueva Funcion"}
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-400 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Pelicula</label>
          <select
            value={movieId}
            onChange={(e) => setMovieId(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
          >
            <option value={0}>Seleccionar...</option>
            {movies.map((m: MovieList) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Sala</label>
          <select
            value={salaId}
            onChange={(e) => setSalaId(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
          >
            <option value={0}>Seleccionar...</option>
            {salas.map((s: SalaDetail) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.rows}&times;{s.cols})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Fecha y Hora</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Formatos</label>
          <div className="flex flex-wrap gap-2">
            {formats.map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => toggleFormat(fmt.id)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  formatIds.includes(fmt.id)
                    ? "bg-red-600 border-red-600 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                }`}
              >
                {fmt.name}
              </button>
            ))}
          </div>
          {formats.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              No hay formatos disponibles. Crealos en la seccion Formatos.
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => navigate("/reservations/showtimes")}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !movieId || !salaId || !startTime}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {mutation.isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminFuncionForm;
