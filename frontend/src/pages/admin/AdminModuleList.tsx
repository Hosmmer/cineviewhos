import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createModule, updateModule, deleteModule, fetchRoles } from "@/services/moduleService";
import type { Module, Role } from "@/types/modules";
import * as AllIcons from "@/components/lucide-icons.generated";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const iconLookup = AllIcons as Record<string, React.ComponentType<{ className?: string }>>;
function getIcon(name: string, className: string) {
  const Icon = iconLookup[name];
  return Icon ? <Icon className={className} /> : <span className="text-gray-600 text-xs">{name}</span>;
}

const ICON_CHOICES = ["Home", "Film", "Clapperboard", "Tags", "User", "Users", "Star", "Ticket", "Calendar", "Settings", "Shield", "Monitor", "LayoutDashboard", "Package", "Cog"];

function AdminModuleList() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", icon: "Package", route: "", parent: "", order: "0", is_active: true });
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [formError, setFormError] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const { data: modules, isLoading, error } = useQuery<Module[]>({
    queryKey: ["admin-modules"],
    queryFn: async () => { const { data } = await (await import("@/api/django")).default.get<{ results: Module[] }>("/admin/modules/?flat=true"); return data.results; },
  });

  const { data: roles } = useQuery<Role[]>({
    queryKey: ["admin-roles"],
    queryFn: fetchRoles,
  });

  const grouped = useMemo(() => {
    if (!modules) return [];
    const roots = modules.filter((m) => !m.parent);
    const withChildren = roots.filter((m) => modules.some((c) => c.parent === m.id));
    const withoutChildren = roots.filter((m) => !modules.some((c) => c.parent === m.id));
    const sorted = [
      ...withChildren.sort((a, b) => a.name.localeCompare(b.name)),
      ...withoutChildren.sort((a, b) => a.name.localeCompare(b.name)),
    ];
    return sorted.map((root) => ({
      ...root,
      children: modules.filter((m) => m.parent === root.id),
    }));
  }, [modules]);

  const totalPages = Math.max(1, Math.ceil(grouped.length / PER_PAGE));
  const paged = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return grouped.slice(start, start + PER_PAGE);
  }, [grouped, page]);

  const creationMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createModule(data as Partial<Module>),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-modules"] }); queryClient.invalidateQueries({ queryKey: ["modules"] }); closeForm(); },
    onError: (e: { response?: { data?: Record<string, string[]> } }) => setFormError(Object.values(e.response?.data || {})[0]?.[0] || "Error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: Record<string, unknown>) => updateModule(id as number, data as Partial<Module>),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-modules"] }); queryClient.invalidateQueries({ queryKey: ["modules"] }); closeForm(); },
    onError: (e: { response?: { data?: Record<string, string[]> } }) => setFormError(Object.values(e.response?.data || {})[0]?.[0] || "Error"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteModule,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-modules"] }); queryClient.invalidateQueries({ queryKey: ["modules"] }); setDeleteId(null); },
  });

  const openCreate = () => { setEditingModule(null); setForm({ name: "", slug: "", icon: "Package", route: "", parent: "", order: "0", is_active: true }); setSelectedRoles([]); setFormError(""); setShowForm(true); };
  const openEdit = (mod: Module) => { setEditingModule(mod); setForm({ name: mod.name, slug: mod.slug, icon: mod.icon, route: mod.route || "", parent: mod.parent?.toString() || "", order: String(mod.order), is_active: mod.is_active }); setSelectedRoles(mod.roles || []); setFormError(""); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingModule(null); setFormError(""); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const payload = { ...form, order: parseInt(form.order) || 0, parent: form.parent ? parseInt(form.parent) : null, roles: selectedRoles };
    if (editingModule) updateMutation.mutate({ id: editingModule.id, ...payload });
    else creationMutation.mutate(payload);
  };

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isPending = creationMutation.isPending || updateMutation.isPending;

  const renderRoleBadges = (roleIds?: number[]) => {
    if (!roleIds?.length) return <span className="text-xs text-gray-600">Publico</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {roleIds.map((roleId) => {
          const role = roles?.find((r) => r.id === roleId);
          return role ? <span key={roleId} className="text-xs bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded">{role.name}</span> : null;
        })}
      </div>
    );
  };

  const renderRow = (mod: Module, isChild: boolean) => {
    const hasChildren = mod.children?.length > 0;
    const isExpanded = expanded.has(mod.id);
    return (
      <tr key={mod.id} className={`${isChild ? "bg-gray-900/50" : "hover:bg-gray-800/50"}`}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {isChild && <span className="text-gray-700 text-xs ml-4">└</span>}
            {hasChildren ? (
              <button onClick={() => toggleExpand(mod.id)} className="flex items-center gap-2 text-sm text-white hover:text-red-400 transition-colors">
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                {!isChild && getIcon(mod.icon, "w-4 h-4 text-gray-400 shrink-0")}
                <span className="font-medium">{mod.name}</span>
              </button>
            ) : (
              <span className="flex items-center gap-2">
                {!isChild && getIcon(mod.icon, "w-4 h-4 text-gray-400 shrink-0")}
                <span className={`text-sm ${isChild ? "text-gray-300" : "text-white font-medium"}`}>{mod.name}</span>
              </span>
            )}
          </div>
        </td>
        <td className="hidden sm:table-cell px-4 py-3">{!hasChildren && getIcon(mod.icon, "w-4 h-4 text-gray-400")}</td>
        <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-500 font-mono text-xs">{mod.route || "-"}</td>
        <td className="hidden md:table-cell px-4 py-3">{renderRoleBadges(mod.roles)}</td>
        <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-400 text-center">{mod.order}</td>
        <td className="hidden md:table-cell px-4 py-3 text-center">{mod.is_active ? <span className="inline-block w-2 h-2 bg-green-500 rounded-full" /> : <span className="inline-block w-2 h-2 bg-gray-600 rounded-full" />}</td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => openEdit(mod)} className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">Editar</button>
            <button onClick={() => setDeleteId(mod.id)} className="px-3 py-1 text-xs bg-red-900/50 text-red-400 rounded hover:bg-red-900 transition-colors">Eliminar</button>
          </div>
        </td>
      </tr>
    );
  };

  if (isLoading) return <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-gray-800 rounded animate-pulse" />)}</div>;
  if (error) return <div className="text-center py-12"><p className="text-red-400 mb-4">Failed to load modules.</p><button onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-modules"] })} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Retry</button></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Modulos</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium">+ Nuevo Modulo</button>
      </div>

      <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Nombre</th>
              <th className="hidden sm:table-cell text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Icono</th>
              <th className="hidden lg:table-cell text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Ruta</th>
              <th className="hidden md:table-cell text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Roles Acceso</th>
              <th className="hidden md:table-cell text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Orden</th>
              <th className="hidden md:table-cell text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Activo</th>
              <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {paged.length ? paged.map((root) => (
              <>
                {renderRow(root, false)}
                {root.children.length > 0 && expanded.has(root.id) && root.children.map((child) => renderRow(child, true))}
              </>
            )) : <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">No hay modulos. Crea el primero.</td></tr>}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <span className="text-xs text-gray-500">Pagina {page} de {totalPages}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${p === page ? "bg-red-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">{editingModule ? "Editar Modulo" : "Nuevo Modulo"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 bg-gray-800 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required className="w-full px-3 py-2 bg-gray-800 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Icono</label>
                  <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full px-3 py-2 bg-gray-800 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500">
                    {ICON_CHOICES.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Ruta</label>
                  <input value={form.route} onChange={(e) => setForm({ ...form, route: e.target.value })} className="w-full px-3 py-2 bg-gray-800 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="ej: /admin/movies" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Orden</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="w-full px-3 py-2 bg-gray-800 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Modulo Padre</label>
                <select value={form.parent} onChange={(e) => setForm({ ...form, parent: e.target.value })} className="w-full px-3 py-2 bg-gray-800 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">Ninguno (raiz)</option>
                  {modules?.filter((m) => !editingModule || m.id !== editingModule.id).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500" />
                <span className="text-sm text-gray-300">Activo</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Roles con acceso</label>
                <div className="grid grid-cols-2 gap-2">
                  {roles?.map((role) => (
                    <label key={role.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-800 cursor-pointer">
                      <input type="checkbox" checked={selectedRoles.includes(role.id)} onChange={() => setSelectedRoles((prev) => prev.includes(role.id) ? prev.filter((r) => r !== role.id) : [...prev, role.id])} className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500" />
                      <span className="text-xs text-white">{role.name}</span>
                    </label>
                  ))}
                  {!roles?.length && <p className="text-xs text-gray-500 col-span-2">No hay roles. Crea roles primero.</p>}
                </div>
                <p className="text-xs text-gray-500 mt-1">Si no se selecciona ningun rol, el modulo es publico.</p>
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
            <h3 className="text-lg font-semibold text-white mb-2">Eliminar Modulo</h3>
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

export default AdminModuleList;
