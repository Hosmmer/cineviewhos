import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminFranjas, deleteFranja } from "@/features/bookings/api/franjas.api";
import { formatTimeOfDay } from "@/utils/format";
import ConfirmModal from "@/components/ui/ConfirmModal";

function AdminFranjaList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: franjasData, isLoading, error } = useQuery({
    queryKey: ["admin-franjas"],
    queryFn: fetchAdminFranjas,
  });

  const franjas = franjasData?.results ?? [];

  const deleteMutation = useMutation({
    mutationFn: deleteFranja,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-franjas"] });
      queryClient.invalidateQueries({ queryKey: ["funciones"] });
      queryClient.invalidateQueries({ queryKey: ["admin-funciones"] });
      setDeleteId(null);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-800 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Failed to load franjas.</p>
        <button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["admin-franjas"] })
          }
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Franjas</h1>
        <button
          onClick={() => navigate("/reservations/franjas/create")}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
        >
          + New Franja
        </button>
      </div>

      <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                Name
              </th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                Start
              </th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                End
              </th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                Status
              </th>
              <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {franjas.length > 0 ? (
              franjas.map((franja) => (
                <tr key={franja.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm text-white">{franja.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {formatTimeOfDay(franja.start_time)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {formatTimeOfDay(franja.end_time)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {franja.is_active ? (
                      <span className="px-2 py-0.5 bg-emerald-600/10 text-emerald-400 border border-emerald-600/30 rounded-full text-xs font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-600/10 text-amber-400 border border-amber-600/30 rounded-full text-xs font-medium">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          navigate(`/reservations/franjas/${franja.id}/edit`)
                        }
                        className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(franja.id)}
                        className="px-3 py-1 text-xs bg-red-900/50 text-red-400 rounded hover:bg-red-900 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  No franjas found. Create your first franja to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={deleteId !== null}
        title="Delete Franja"
        message="Are you sure you want to delete this franja? This will deactivate it."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isPending={deleteMutation.isPending}
        error={
          deleteMutation.error
            ? (deleteMutation.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to delete franja."
            : null
        }
        onConfirm={() => deleteMutation.mutate(deleteId!)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

export default AdminFranjaList;
