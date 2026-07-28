import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, updateUserRoles } from "@/services/authService";
import { fetchRoles } from "@/services/moduleService";
import type { UserAdmin, Role } from "@/types/modules";

function AdminUserList() {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<UserAdmin | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  const { data: users, isLoading, error } = useQuery<UserAdmin[]>({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
  });

  const { data: roles } = useQuery<Role[]>({
    queryKey: ["admin-roles"],
    queryFn: fetchRoles,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, roles }: { id: number; roles: number[] }) => updateUserRoles(id, roles),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); setEditingUser(null); },
  });

  const openEdit = (user: UserAdmin) => { setEditingUser(user); setSelectedRoles(user.roles); };
  const toggleRole = (roleId: number) => setSelectedRoles((prev) => prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]);

  const handleSave = () => {
    if (!editingUser) return;
    updateMutation.mutate({ id: editingUser.id, roles: selectedRoles });
  };

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-800 rounded animate-pulse" />)}</div>;
  if (error) return <div className="text-center py-12"><p className="text-red-400 mb-4">Failed to load users.</p><button onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Retry</button></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Usuarios</h1>
      </div>

      <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Usuario</th>
              <th className="hidden sm:table-cell text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Email</th>
              <th className="hidden md:table-cell text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Roles</th>
              <th className="hidden md:table-cell text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Staff</th>
              <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users?.length ? users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-3"><span className="text-sm text-white font-medium">{user.username}</span>{user.first_name ? <span className="text-xs text-gray-400 ml-2">{user.first_name} {user.last_name}</span> : null}</td>
                <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-400">{user.email}</td>
                <td className="hidden md:table-cell px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.length ? user.roles.map((roleId) => {
                      const role = roles?.find((r) => r.id === roleId);
                      return role ? <span key={roleId} className="text-xs bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded">{role.name}</span> : null;
                    }) : <span className="text-xs text-gray-500">Sin roles</span>}
                  </div>
                </td>
                <td className="hidden md:table-cell px-4 py-3 text-center">
                  {user.is_staff ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-600/20 text-red-500 text-xs font-bold">S</span> : <span className="text-xs text-gray-600">-</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(user)} className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">Roles</button>
                </td>
              </tr>
            )) : <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">No hay usuarios.</td></tr>}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Roles de {editingUser.username}</h3>
            <p className="text-sm text-gray-400 mb-4">Selecciona los roles para este usuario.</p>
            <div className="space-y-2 mb-6">
              {roles?.map((role) => (
                <label key={role.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-800 cursor-pointer">
                  <input type="checkbox" checked={selectedRoles.includes(role.id)} onChange={() => toggleRole(role.id)} className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500" />
                  <div>
                    <span className="text-sm text-white">{role.name}</span>
                    {role.description && <p className="text-xs text-gray-500">{role.description}</p>}
                  </div>
                </label>
              ))}
              {!roles?.length && <p className="text-sm text-gray-500">No hay roles disponibles.</p>}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600">Cancelar</button>
              <button onClick={handleSave} disabled={updateMutation.isPending} className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">{updateMutation.isPending ? "Guardando..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUserList;
