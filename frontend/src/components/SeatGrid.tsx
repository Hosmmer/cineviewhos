import type { Seat } from "@/types/reservations";

interface SeatGridProps {
  seats: Seat[];
  rows: number;
  cols: number;
  selected: Set<number>;
  onToggle: (seatId: number) => void;
}

function SeatGrid({ seats, rows, cols, selected, onToggle }: SeatGridProps) {
  const getSeat = (row: number, col: number): Seat | undefined =>
    seats.find((s) => s.row === row && s.col === col);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-6 text-sm text-gray-400 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-700 border border-gray-600 rounded" />
          Disponible
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded" />
          Seleccionado
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-600/30 border border-gray-600/30 rounded" />
          Ocupado
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <div className="w-3/4 h-2 bg-gray-600 rounded-full" />
      </div>

      <div
        className="grid gap-2 justify-center"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 36px))`,
        }}
      >
        {Array.from({ length: rows }, (_, r) => r + 1).map((row) =>
          Array.from({ length: cols }, (_, c) => c + 1).map((col) => {
            const seat = getSeat(row, col);
            const isOccupied = seat?.is_occupied ?? true;
            const seatId = seat?.id ?? 0;
            const isSelected = selected.has(seatId);

            if (isOccupied) {
              return (
                <div
                  key={`${row}-${col}`}
                  className="w-8 h-8 bg-gray-600/20 rounded border border-gray-600/20 cursor-not-allowed"
                />
              );
            }

            return (
              <button
                key={`${row}-${col}`}
                onClick={() => onToggle(seatId)}
                className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-red-600 text-white"
                    : "bg-gray-700 border border-gray-600 hover:bg-gray-600 text-gray-300"
                }`}
              >
                {row}-{col}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}

export default SeatGrid;
