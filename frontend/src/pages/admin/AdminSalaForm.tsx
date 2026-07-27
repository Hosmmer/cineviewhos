import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSala, updateSala, fetchAdminSala } from "@/services/reservationService";

function AdminSalaForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;
  const [name, setName] = useState("");
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(8);
  const [error, setError] = useState<string | null>(null);

  const { data: sala } = useQuery({
    queryKey: ["admin-sala", id],
    queryFn: () => fetchAdminSala(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (sala) {
      setName(sala.name);
      setRows(sala.rows);
      setCols(sala.cols);
    }
  }, [sala]);

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? updateSala(Number(id), { name })
        : createSala({ name, rows, cols }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-salas"] });
      navigate("/admin/salas");
    },
    onError: (err: any) => {
      setError(err?.response?.data?.detail ?? "Error al guardar.");
    },
  });

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
          <label className="block text-sm text-gray-400 mb-1">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            onClick={() => navigate("/admin/salas")}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !name.trim()}
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
