import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminFranjas, deleteFranja } from "@/services/reservationService";

function formatTime(iso: string): string {
  return new Date(`1970-01-01T${iso}`).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

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
                    {formatTime(franja.start_time)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {formatTime(franja.end_time)}
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

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Franja</h3>
            <p className="text-sm text-gray-400 mb-6">
              Are you sure you want to delete this franja? This will deactivate
              it.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
            {deleteMutation.error && (
              <p className="mt-3 text-sm text-red-400">
                {(
                  deleteMutation.error as {
                    response?: { data?: { detail?: string } };
                  }
                )?.response?.data?.detail || "Failed to delete franja."}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminFranjaList;
