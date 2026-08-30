import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, MapPin } from "lucide-react";
import type { Funcion } from "@/features/bookings/types/funcion.types";
import { formatDate, formatTime } from "@/utils/format";
import {
  buildFormatTabs,
  buildFranjaTabs,
  groupByCine,
  groupByDate,
  groupBySalaNumber,
} from "@/features/movies/utils/movies.utils";

interface MovieShowtimesProps {
  movieId: string;
  funciones: Funcion[];
}

function MovieShowtimes({ movieId, funciones }: MovieShowtimesProps) {
  const navigate = useNavigate();
  const [activeFranja, setActiveFranja] = useState(0);
  const [activeFormat, setActiveFormat] = useState(0);

  const franjaTabs = useMemo(() => buildFranjaTabs(funciones), [funciones]);
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

  if (franjaTabs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/30 border border-gray-700/30 rounded-xl">
        <Clock className="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500">No hay horarios disponibles por ahora.</p>
      </div>
    );
  }

  return (
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
        {Array.from(groupedByCine.entries()).map(([cine, cineFunciones]) => (
          <div
            key={cine}
            className="bg-gray-800 border border-gray-700/50 rounded-xl p-5 flex-1 min-w-[280px]"
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-red-400 shrink-0" />
              <h3 className="text-white font-semibold text-sm">{cine}</h3>
            </div>
            <div className="space-y-4">
              {Array.from(groupBySalaNumber(cineFunciones).entries())
                .sort(([a], [b]) => a - b)
                .map(([salaNumber, salaFunciones]) => (
                  <div key={salaNumber}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Sala {salaNumber}
                    </p>
                    <div className="space-y-3">
                      {Array.from(groupByDate(salaFunciones).entries()).map(
                        ([dayKey, dayFunciones]) => (
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
                                        `/movies/${movieId}/funcion/${f.id}/seats`,
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
                        ),
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default MovieShowtimes;
