import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { fetchAdminSalas, deleteSala } from "@/features/bookings/api/salas.api";
import type { PaginatedResponse } from "@/services/types";
import type { SalaDetail } from "@/features/bookings/types/sala.types";
import ConfirmModal from "@/components/ui/ConfirmModal";

function AdminSalaList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, error } = useQuery<PaginatedResponse<SalaDetail>>({
    queryKey: ["admin-salas"],
    queryFn: () => fetchAdminSalas(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSala,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-salas"] });
      setDeleteId(null);
    },
  });

  const salas = data?.results ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Salas</h1>
        <button
          onClick={() => navigate("/reservations/rooms/create")}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Nueva Sala
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400">Error al cargar salas.</p>
        </div>
      ) : salas.length > 0 ? (
        <div className="bg-gray-800 border border-gray-700/50 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-750 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-gray-400 font-medium">Cine</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Sala</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Filas</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Columnas</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Asientos</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Funciones</th>
                <th className="px-4 py-3 text-gray-400 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {salas.map((s: SalaDetail) => (
                <tr key={s.id} className="hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-white">{s.cine_name}</td>
                  <td className="px-4 py-3 text-white">{s.number}</td>
                  <td className="px-4 py-3 text-gray-300">{s.rows}</td>
                  <td className="px-4 py-3 text-gray-300">{s.cols}</td>
                  <td className="px-4 py-3 text-gray-300">{s.seat_count}</td>
                  <td className="px-4 py-3 text-gray-300">{s.active_funcion_count}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/reservations/rooms/${s.id}/edit`)}
                      className="px-3 py-1 text-xs text-blue-400 hover:text-blue-300 mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteId(s.id)}
                      className="px-3 py-1 text-xs text-red-400 hover:text-red-300"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-16">No hay salas creadas.</p>
      )}

      <ConfirmModal
        open={deleteId !== null}
        title="Eliminar esta sala?"
        message="Esta accion no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        isPending={deleteMutation.isPending}
        error={deleteMutation.error ? "Error al eliminar." : null}
        onConfirm={() => deleteMutation.mutate(deleteId!)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

export default AdminSalaList;
