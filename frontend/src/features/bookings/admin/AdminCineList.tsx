import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminCines, deleteCine } from "@/features/bookings/api/cines.api";
import ConfirmModal from "@/components/ui/ConfirmModal";

function AdminCineList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: cinesData, isLoading, error } = useQuery({
    queryKey: ["admin-cines"],
    queryFn: fetchAdminCines,
  });

  const cines = cinesData?.results ?? [];

  const deleteMutation = useMutation({
    mutationFn: deleteCine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cines"] });
      queryClient.invalidateQueries({ queryKey: ["admin-cines-dropdown"] });
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
        <p className="text-red-400 mb-4">Failed to load cines.</p>
        <button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["admin-cines"] })
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
        <h1 className="text-2xl font-bold text-white">Cines</h1>
        <button
          onClick={() => navigate("/reservations/cines/create")}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
        >
          + New Cine
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
                Status
              </th>
              <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {cines.length > 0 ? (
              cines.map((cine) => (
                <tr key={cine.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm text-white">{cine.name}</td>
                  <td className="px-4 py-3 text-sm">
                    {cine.is_active ? (
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
                        onClick={() => navigate(`/reservations/cines/${cine.id}`)}
                        className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/reservations/cines/${cine.id}/edit`)
                        }
                        className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(cine.id)}
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
                <td colSpan={3} className="px-4 py-12 text-center text-gray-500">
                  No cines found. Create your first cine to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={deleteId !== null}
        title="Delete Cine"
        message="Are you sure you want to delete this cine? This will deactivate it."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isPending={deleteMutation.isPending}
        error={
          deleteMutation.error
            ? (deleteMutation.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to delete cine."
            : null
        }
        onConfirm={() => deleteMutation.mutate(deleteId!)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

export default AdminCineList;
