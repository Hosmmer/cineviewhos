import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminFunciones, deleteFuncion } from "@/services/reservationService";
import type { PaginatedResponse } from "@/types/movies";
import type { Funcion } from "@/types/reservations";

function AdminFuncionList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<PaginatedResponse<Funcion>>({
    queryKey: ["admin-funciones"],
    queryFn: () => fetchAdminFunciones(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFuncion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-funciones"] });
    },
  });

  const funciones = data?.results ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Funciones</h1>
        <button
          onClick={() => navigate("/reservations/funciones/create")}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Nueva Funcion
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-800 rounded animate-pulse" />)}</div>
      ) : error ? (
        <p className="text-red-400 text-center py-12">Error al cargar funciones.</p>
      ) : funciones.length > 0 ? (
        <div className="bg-gray-800 border border-gray-700/50 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-750 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-gray-400 font-medium">Pelicula</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Sala</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Fecha/Hora</th>
                <th className="px-4 py-3 text-gray-400 font-medium">Estado</th>
                <th className="px-4 py-3 text-gray-400 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {funciones.map((f: Funcion) => (
                <tr key={f.id} className="hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-white">{f.movie_title}</td>
                  <td className="px-4 py-3 text-gray-300">{f.sala_name}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {new Date(f.start_time).toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-md ${f.is_active ? "bg-green-900/50 text-green-400 border border-green-700" : "bg-red-900/50 text-red-400 border border-red-700"}`}>
                      {f.is_active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => navigate(`/reservations/funciones/${f.id}/edit`)} className="px-3 py-1 text-xs text-blue-400 hover:text-blue-300 mr-2">Editar</button>
                    <button onClick={() => deleteMutation.mutate(f.id)} className="px-3 py-1 text-xs text-red-400 hover:text-red-300">Desactivar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-16">No hay funciones creadas.</p>
      )}
    </div>
  );
}

export default AdminFuncionList;
