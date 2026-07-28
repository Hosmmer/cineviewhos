import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchRoles, createRole, updateRole, deleteRole } from "@/services/moduleService";
import type { Role } from "@/types/modules";

function AdminRoleList() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [formError, setFormError] = useState("");

  const { data: roles, isLoading, error } = useQuery<Role[]>({
    queryKey: ["admin-roles"],
    queryFn: fetchRoles,
  });

  const createMutation = useMutation({
    mutationFn: createRole,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-roles"] }); closeForm(); },
    onError: (e: { response?: { data?: Record<string, string[]> } }) => setFormError(Object.values(e.response?.data || {})[0]?.[0] || "Error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<Role> & { id: number }) => updateRole(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-roles"] }); closeForm(); },
    onError: (e: { response?: { data?: Record<string, string[]> } }) => setFormError(Object.values(e.response?.data || {})[0]?.[0] || "Error"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-roles"] }); setDeleteId(null); },
  });

  const openCreate = () => { setEditingRole(null); setForm({ name: "", slug: "", description: "" }); setFormError(""); setShowForm(true); };
  const openEdit = (role: Role) => { setEditingRole(role); setForm({ name: role.name, slug: role.slug, description: role.description || "" }); setFormError(""); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingRole(null); setFormError(""); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (editingRole) updateMutation.mutate({ id: editingRole.id, ...form });
    else createMutation.mutate(form);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-800 rounded animate-pulse" />)}</div>;
  if (error) return <div className="text-center py-12"><p className="text-red-400 mb-4">Failed to load roles.</p><button onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-roles"] })} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Retry</button></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Roles</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium">+ Nuevo Rol</button>
      </div>

      <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Nombre</th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Slug</th>
              <th className="hidden sm:table-cell text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Descripcion</th>
              <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {roles?.length ? roles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3 text-sm text-white">{role.name}</td>
                <td className="px-4 py-3 text-sm"><code className="text-xs bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded">{role.slug}</code></td>
                <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-400">{role.description || "-"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(role)} className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">Editar</button>
                    <button onClick={() => setDeleteId(role.id)} className="px-3 py-1 text-xs bg-red-900/50 text-red-400 rounded hover:bg-red-900 transition-colors">Eliminar</button>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-500">No hay roles. Crea el primero.</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">{editingRole ? "Editar Rol" : "Nuevo Rol"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 bg-gray-800 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="w-full px-3 py-2 bg-gray-800 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="ej: admin" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Descripcion</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 bg-gray-800 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              {formError && <p className="text-red-400 text-xs">{formError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeForm} className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">Cancelar</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">{isPending ? "Guardando..." : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Eliminar Rol</h3>
            <p className="text-sm text-gray-400 mb-6">Estas seguro? Esta accion no se puede deshacer.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">Cancelar</button>
              <button onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">{deleteMutation.isPending ? "Eliminando..." : "Eliminar"}</button>
            </div>
            {deleteMutation.error && <p className="mt-3 text-sm text-red-400">{(deleteMutation.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Error al eliminar."}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRoleList;
