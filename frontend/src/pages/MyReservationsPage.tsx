import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyReservas, anularReserva } from "@/services/reservationService";
import type { ReservaList } from "@/types/reservations";
import { useState } from "react";

function MyReservationsPage() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-reservas"],
    queryFn: () => fetchMyReservas(),
    refetchOnMount: true,
  });

  const anularMutation = useMutation({
    mutationFn: (reservaId: number) => anularReserva(reservaId),
    onSuccess: () => {
      setMessage({ type: "success", text: "Reserva anulada." });
      queryClient.invalidateQueries({ queryKey: ["my-reservas"] });
      queryClient.invalidateQueries({ queryKey: ["seats"] });
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail ?? "Error al anular la reserva.";
      setMessage({ type: "error", text: detail });
    },
  });

  const reservas = data?.results ?? [];

  const statusBadge = (status: string) => {
    if (status === "confirmed") {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-900/50 text-green-400 border border-green-700 rounded-md">
          Confirmada
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-red-900/50 text-red-400 border border-red-700 rounded-md">
        Anulada
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-white mb-6">Mis Reservas</h1>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-900/50 border border-green-700 text-green-400"
              : "bg-red-900/50 border border-red-700 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400">Error al cargar las reservas.</p>
        </div>
      ) : reservas.length > 0 ? (
        <div className="space-y-3">
          {reservas.map((r: ReservaList) => (
            <div
              key={r.id}
              className="bg-gray-800 border border-gray-700/50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{r.movie_title}</p>
                  <p className="text-gray-400 text-sm">
                    {r.sala_name} &middot;{" "}
                    {new Date(r.start_time).toLocaleString("es-CO", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {r.seat_count} asiento{r.seat_count !== 1 ? "s" : ""} &middot;{" "}
                    {new Date(r.confirmed_at).toLocaleString("es-CO", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {statusBadge(r.status)}
                  {r.status === "confirmed" && (
                    <button
                      onClick={() => anularMutation.mutate(r.id)}
                      disabled={anularMutation.isPending}
                      className="px-3 py-1.5 text-xs font-medium text-red-400 border border-red-700 rounded-md hover:bg-red-900/50 transition-colors disabled:opacity-50"
                    >
                      {anularMutation.isPending ? "Anulando..." : "Anular"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <p className="text-gray-500 text-lg">No tienes reservas aun.</p>
          <p className="text-gray-600 text-sm mt-1">
            Reserva una pelicula para verla aqui.
          </p>
        </div>
      )}
    </div>
  );
}

export default MyReservationsPage;
