import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminReservas, adminAnularReserva } from "@/features/bookings/api/reservas.api";
import type { PaginatedResponse } from "@/services/types";
import type { ReservaList } from "@/features/bookings/types/reserva.types";

function AdminReservationList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<PaginatedResponse<ReservaList>>({
    queryKey: ["admin-reservas"],
    queryFn: () => fetchAdminReservas(),
  });

  const anularMutation = useMutation({
    mutationFn: adminAnularReserva,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reservas"] });
    },
  });

  const reservas = data?.results ?? [];

  const statusBadge = (status: string) => {
    if (status === "confirmed") {
      return <span className="px-2 py-1 text-xs font-medium bg-green-900/50 text-green-400 border border-green-700 rounded-md">Confirmada</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-red-900/50 text-red-400 border border-red-700 rounded-md">Anulada</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Reservas</h1>
        <button
          onClick={() => navigate("/reservations/bookings/create")}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
        >
          + Nueva reserva
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-800 rounded animate-pulse" />)}</div>
      ) : error ? (
        <p className="text-red-400 text-center py-12">Error al cargar reservas.</p>
      ) : reservas.length > 0 ? (
        <div className="bg-gray-800 border border-gray-700/50 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-750 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-gray-400 font-medium">Cliente</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Pelicula</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Sala</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Fecha/Hora</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Asientos</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Estado</th>
                <th className="px-4 py-3 text-gray-400 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {reservas.map((r: ReservaList) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-white">{r.user_name}</td>
                  <td className="px-4 py-3 text-gray-300">{r.movie_title}</td>
                  <td className="px-4 py-3 text-gray-300">{r.sala_name}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {new Date(r.start_time).toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" })}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {(r.seats ?? []).length > 0
                      ? (r.seats ?? [])
                          .map(
                            (s) =>
                              `F${s.row}C${s.col}${s.person_name ? ` (${s.person_name})` : ""}`,
                          )
                          .join(", ")
                      : r.seat_count}
                  </td>
                  <td className="px-4 py-3">{statusBadge(r.status)}</td>
                  <td className="px-4 py-3 text-right">
                    {r.status === "confirmed" && (
                      <button
                        onClick={() => anularMutation.mutate(r.id)}
                        disabled={anularMutation.isPending}
                        className="px-3 py-1 text-xs text-red-400 hover:text-red-300 border border-red-700 rounded-md hover:bg-red-900/50 disabled:opacity-50"
                      >
                        Anular
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-16">No hay reservas.</p>
      )}
    </div>
  );
}

export default AdminReservationList;
