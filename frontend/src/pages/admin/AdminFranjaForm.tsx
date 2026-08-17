import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminFranja,
  createFranja,
  updateFranja,
} from "@/services/reservationService";

function AdminFranjaForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");

  const { data: franja, isLoading } = useQuery({
    queryKey: ["admin-franja", id],
    queryFn: () => fetchAdminFranja(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && franja) {
      setName(franja.name);
      setStartTime(franja.start_time.slice(0, 5));
      setEndTime(franja.end_time.slice(0, 5));
    }
  }, [isEdit, franja]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-franjas"] });
    queryClient.invalidateQueries({ queryKey: ["funciones"] });
    queryClient.invalidateQueries({ queryKey: ["admin-funciones"] });
  };

  const createMutation = useMutation({
    mutationFn: createFranja,
    onSuccess: () => {
      invalidate();
      navigate("/reservations/franjas");
    },
    onError: (err: { response?: { data?: Record<string, string[]> } }) => {
      const data = err?.response?.data;
      if (data) {
        const msgs = Object.values(data).flat();
        setError(msgs[0] || "Failed to save franja.");
      } else {
        setError("Failed to save franja.");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; start_time: string; end_time: string }) =>
      updateFranja(Number(id), data),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["admin-franja", id] });
      navigate("/reservations/franjas");
    },
    onError: (err: { response?: { data?: Record<string, string[]> } }) => {
      const data = err?.response?.data;
      if (data) {
        const msgs = Object.values(data).flat();
        setError(msgs[0] || "Failed to save franja.");
      } else {
        setError("Failed to save franja.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Franja name cannot be empty.");
      return;
    }
    if (!startTime || !endTime) {
      setError("Start and end time are required.");
      return;
    }
    if (startTime >= endTime) {
      setError("Start time must be before end time.");
      return;
    }

    const payload = {
      name: name.trim(),
      start_time: `${startTime}:00`,
      end_time: `${endTime}:00`,
    };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
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
        {isEdit ? "Edit Franja" : "New Franja"}
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
            placeholder="e.g. Manana, Tarde, Noche"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="start_time"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Start
            </label>
            <input
              id="start_time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5 border border-gray-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div>
            <label
              htmlFor="end_time"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              End
            </label>
            <input
              id="end_time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5 border border-gray-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={() => navigate("/reservations/franjas")}
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
                ? "Update Franja"
                : "Create Franja"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminFranjaForm;
