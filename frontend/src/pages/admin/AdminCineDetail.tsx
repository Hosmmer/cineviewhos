import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminCineSchedule } from "@/services/reservationService";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function AdminCineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: cine, isLoading } = useQuery({
    queryKey: ["admin-cine-schedule", id],
    queryFn: () => fetchAdminCineSchedule(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-800 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!cine) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Cine no encontrado.</p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate("/reservations/cines")}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{cine.name}</h1>
        <button
          onClick={() => navigate("/reservations/rooms/create")}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
        >
          + Nueva sala
        </button>
      </div>

      {cine.salas.length === 0 ? (
        <p className="text-gray-400 text-center py-16">
          Este cine no tiene salas. Crea la primera.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cine.salas.map((sala) => (
            <div
              key={sala.id}
              className="bg-gray-800 border border-gray-700/50 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-sm">
                  Sala {sala.number}
                </h3>
                <span className="text-xs text-gray-400">
                  {sala.rows}&times;{sala.cols} puestos
                </span>
              </div>

              {sala.funciones.length === 0 ? (
                <p className="text-gray-500 text-sm">Sin funciones asignadas.</p>
              ) : (
                <div className="space-y-2">
                  {sala.funciones.map((f) => (
                    <div
                      key={f.id}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 border ${
                        f.is_active
                          ? "bg-gray-700/40 border-gray-600/30"
                          : "bg-gray-800/40 border-gray-700/30 opacity-60"
                      }`}
                    >
                      <div>
                        <p className="text-white text-sm">{f.movie_title}</p>
                        <p className="text-gray-400 text-xs">
                          {formatDateTime(f.start_time)}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          f.is_active
                            ? "bg-emerald-600/10 text-emerald-400 border-emerald-600/30"
                            : "bg-amber-600/10 text-amber-400 border-amber-600/30"
                        }`}
                      >
                        {f.is_active ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminCineDetail;
