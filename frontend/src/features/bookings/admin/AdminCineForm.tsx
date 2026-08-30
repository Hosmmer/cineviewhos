import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminCine,
  createCine,
  updateCine,
} from "@/features/bookings/api/cines.api";

function AdminCineForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const { data: cine, isLoading } = useQuery({
    queryKey: ["admin-cine", id],
    queryFn: () => fetchAdminCine(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && cine) {
      setName(cine.name);
    }
  }, [isEdit, cine]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-cines"] });
    queryClient.invalidateQueries({ queryKey: ["admin-cines-dropdown"] });
  };

  const createMutation = useMutation({
    mutationFn: createCine,
    onSuccess: () => {
      invalidate();
      navigate("/reservations/cines");
    },
    onError: (err: { response?: { data?: Record<string, string[]> } }) => {
      const data = err?.response?.data;
      if (data) {
        const msgs = Object.values(data).flat();
        setError(msgs[0] || "Failed to save cine.");
      } else {
        setError("Failed to save cine.");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name: string }) => updateCine(Number(id), data),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["admin-cine", id] });
      navigate("/reservations/cines");
    },
    onError: (err: { response?: { data?: Record<string, string[]> } }) => {
      const data = err?.response?.data;
      if (data) {
        const msgs = Object.values(data).flat();
        setError(msgs[0] || "Failed to save cine.");
      } else {
        setError("Failed to save cine.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Cine name cannot be empty.");
      return;
    }
    if (isEdit) {
      updateMutation.mutate({ name: name.trim() });
    } else {
      createMutation.mutate({ name: name.trim() });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">
        {isEdit ? "Edit Cine" : "New Cine"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5 border border-gray-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="e.g. Guatapuri, Mayales, Buenaventura"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={() => navigate("/reservations/cines")}
            className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
          >
            {isPending ? "Saving..." : isEdit ? "Update Cine" : "Create Cine"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminCineForm;
