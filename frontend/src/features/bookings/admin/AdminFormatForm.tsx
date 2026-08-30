import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminFormat,
  createFormat,
  updateFormat,
} from "@/features/bookings/api/formats.api";

function AdminFormatForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const { data: format, isLoading } = useQuery({
    queryKey: ["admin-format", id],
    queryFn: () => fetchAdminFormat(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && format) {
      setName(format.name);
    }
  }, [isEdit, format]);

  const createMutation = useMutation({
    mutationFn: createFormat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-formats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-formats-dropdown"] });
      queryClient.invalidateQueries({ queryKey: ["admin-funciones"] });
      queryClient.invalidateQueries({ queryKey: ["funciones"] });
      navigate("/reservations/formats");
    },
    onError: (err: { response?: { data?: Record<string, string[]> } }) => {
      const data = err?.response?.data;
      if (data) {
        const msgs = Object.values(data).flat();
        setError(msgs[0] || "Failed to save format.");
      } else {
        setError("Failed to save format.");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name: string }) => updateFormat(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-formats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-formats-dropdown"] });
      queryClient.invalidateQueries({ queryKey: ["admin-funciones"] });
      queryClient.invalidateQueries({ queryKey: ["funciones"] });
      queryClient.invalidateQueries({ queryKey: ["admin-format", id] });
      navigate("/reservations/formats");
    },
    onError: (err: { response?: { data?: Record<string, string[]> } }) => {
      const data = err?.response?.data;
      if (data) {
        const msgs = Object.values(data).flat();
        setError(msgs[0] || "Failed to save format.");
      } else {
        setError("Failed to save format.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Format name cannot be empty.");
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
        {isEdit ? "Edit Format" : "New Format"}
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
            placeholder="e.g. 2D, 3D, IMAX"
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
            onClick={() => navigate("/reservations/formats")}
            className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
          >
            {isPending
              ? "Saving..."
              : isEdit
                ? "Update Format"
                : "Create Format"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminFormatForm;
