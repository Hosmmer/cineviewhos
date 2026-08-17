import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSala,
  updateSala,
  fetchAdminSala,
  fetchAdminCines,
} from "@/services/reservationService";

function AdminSalaForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;
  const [cineId, setCineId] = useState(0);
  const [number, setNumber] = useState(1);
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(8);
  const [error, setError] = useState<string | null>(null);

  const { data: cinesData } = useQuery({
    queryKey: ["admin-cines-dropdown"],
    queryFn: fetchAdminCines,
  });

  const { data: sala } = useQuery({
    queryKey: ["admin-sala", id],
    queryFn: () => fetchAdminSala(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (sala) {
      setCineId(sala.cine);
      setNumber(sala.number);
      setRows(sala.rows);
      setCols(sala.cols);
    }
  }, [sala]);

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? updateSala(Number(id), { cine: cineId, number })
        : createSala({ cine: cineId, number, rows, cols }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-salas"] });
      queryClient.invalidateQueries({ queryKey: ["admin-salas-dropdown"] });
      navigate("/reservations/rooms");
    },
    onError: (err: any) => {
      setError(err?.response?.data?.detail ?? "Error al guardar.");
    },
  });

  const cines = cinesData?.results ?? [];

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-white mb-6">
        {isEdit ? "Editar Sala" : "Nueva Sala"}
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-400 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Cine</label>
          <select
            value={cineId}
            onChange={(e) => setCineId(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
          >
            <option value={0}>Seleccionar...</option>
            {cines.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Numero de sala</label>
          <input
            type="number"
            min={1}
            value={number}
            onChange={(e) => setNumber(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
          />
        </div>

        {!isEdit && (
          <>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Filas</label>
              <input
                type="number"
                min={1}
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Columnas</label>
              <input
                type="number"
                min={1}
                value={cols}
                onChange={(e) => setCols(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </>
        )}

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => navigate("/reservations/rooms")}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !cineId || number < 1}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {mutation.isPending ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminSalaForm;
