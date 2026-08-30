import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/store/AuthContext";
import SeatGrid from "@/features/bookings/components/SeatGrid";
import {
  fetchFuncionDetail,
  fetchSeats,
} from "@/features/bookings/api/funciones.api";
import { createReserva } from "@/features/bookings/api/reservas.api";
import type { FuncionDetail } from "@/features/bookings/types/funcion.types";
import type { Seat } from "@/features/bookings/types/seat.types";

function SeatSelectionPage() {
  const { id: movieId, funcionId } = useParams<{ id: string; funcionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedSeats, setSelectedSeats] = useState<Map<number, string>>(new Map());
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const defaultName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
    user?.username ||
    "";

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
        seats: Array.from(selectedSeats.entries()).map(
          ([seat_id, person_name]) => ({ seat_id, person_name }),
        ),
      }),
    onSuccess: () => {
      setMessage({ type: "success", text: "Reserva confirmada." });
      setSelectedSeats(new Map());
      queryClient.invalidateQueries({ queryKey: ["seats", funcionId] });
      queryClient.invalidateQueries({ queryKey: ["reservas"] });
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail ?? "Error al crear la reserva.";
      setMessage({ type: "error", text: detail });
    },
  });

  const toggleSeat = (seatId: number) => {
    setSelectedSeats((prev) => {
      const next = new Map(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else {
        next.set(seatId, defaultName);
      }
      return next;
    });
  };

  const updateName = (seatId: number, name: string) => {
    setSelectedSeats((prev) => {
      const next = new Map(prev);
      next.set(seatId, name);
      return next;
    });
  };

  const handleConfirm = () => {
    const blank = Array.from(selectedSeats.values()).some(
      (name) => !name.trim(),
    );
    if (blank) {
      setMessage({
        type: "error",
        text: "Debes indicar un nombre para cada asiento seleccionado.",
      });
      return;
    }
    reservaMutation.mutate();
  };

  const seats = seatsData?.results ?? [];
  const selectedSeatIds = new Set(selectedSeats.keys());
  const selectedSeatObjects = seats.filter((s: Seat) => selectedSeatIds.has(s.id));

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
          selected={selectedSeatIds}
          onToggle={toggleSeat}
        />
      </div>

      {selectedSeatObjects.length > 0 && (
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Asientos seleccionados
          </h2>
          {selectedSeatObjects.map((seat) => (
            <div
              key={seat.id}
              className="flex items-center gap-4 bg-gray-800 border border-gray-700/50 rounded-lg p-3"
            >
              <span className="text-white font-medium text-sm w-16 shrink-0">
                F{seat.row}C{seat.col}
              </span>
              <input
                type="text"
                value={selectedSeats.get(seat.id) ?? ""}
                onChange={(e) => updateName(seat.id, e.target.value)}
                placeholder="Nombre de la persona"
                className="w-full bg-gray-700/50 text-white text-sm rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 transition-all"
              />
            </div>
          ))}
        </div>
      )}

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
          {selectedSeats.size} asiento{selectedSeats.size !== 1 ? "s" : ""} seleccionado
          {selectedSeats.size !== 1 ? "s" : ""}
        </p>
        <button
          onClick={handleConfirm}
          disabled={selectedSeats.size === 0 || reservaMutation.isPending}
          className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${
            selectedSeats.size === 0 || reservaMutation.isPending
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
