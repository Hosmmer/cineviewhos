import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SeatGrid from "@/components/SeatGrid";
import {
  fetchFuncionDetail,
  fetchSeats,
  createReserva,
} from "@/services/reservationService";
import type { FuncionDetail } from "@/types/reservations";

function SeatSelectionPage() {
  const { id: movieId, funcionId } = useParams<{ id: string; funcionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data: funcion, isLoading: funcionLoading } = useQuery<FuncionDetail>({
    queryKey: ["funcion", funcionId],
    queryFn: () => fetchFuncionDetail(Number(funcionId)),
    enabled: !!funcionId,
  });

  const { data: seatsData, isLoading: seatsLoading } = useQuery({
    queryKey: ["seats", funcionId],
    queryFn: () => fetchSeats(Number(funcionId)),
    enabled: !!funcionId,
  });

  const reservaMutation = useMutation({
    mutationFn: () =>
      createReserva({
        funcion_id: Number(funcionId),
        seat_ids: Array.from(selected),
      }),
    onSuccess: () => {
      setMessage({ type: "success", text: "Reserva confirmada." });
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ["seats", funcionId] });
      queryClient.invalidateQueries({ queryKey: ["reservas"] });
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail ?? "Error al crear la reserva.";
      setMessage({ type: "error", text: detail });
    },
  });

  const toggleSeat = (seatId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else {
        next.add(seatId);
      }
      return next;
    });
  };

  const seats = seatsData?.results ?? [];

  if (funcionLoading || seatsLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-800 rounded" />
          <div className="h-64 bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!funcion) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400">Funcion no encontrada.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <button
        onClick={() => navigate(`/movies/${movieId}`)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{funcion.movie_title}</h1>
        <p className="text-gray-400 mt-1">
          {funcion.sala_name} &middot;{" "}
          {new Date(funcion.start_time).toLocaleString("es-CO", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </p>
        <p className="text-gray-500 text-sm mt-1">
          {funcion.available_seats} asientos disponibles
        </p>
      </div>

      <div className="bg-gray-800 border border-gray-700/50 rounded-xl p-6">
        <SeatGrid
          seats={seats}
          rows={funcion.sala_rows}
          cols={funcion.sala_cols}
          selected={selected}
          onToggle={toggleSeat}
        />
      </div>

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-900/50 border border-green-700 text-green-400"
              : "bg-red-900/50 border border-red-700 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          {selected.size} asiento{selected.size !== 1 ? "s" : ""} seleccionado
          {selected.size !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => reservaMutation.mutate()}
          disabled={selected.size === 0 || reservaMutation.isPending}
          className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${
            selected.size === 0 || reservaMutation.isPending
              ? "bg-gray-700 cursor-not-allowed text-gray-500"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {reservaMutation.isPending ? "Reservando..." : "Confirmar Reserva"}
        </button>
      </div>
    </div>
  );
}

export default SeatSelectionPage;
