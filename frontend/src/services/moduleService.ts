import djangoApi from "@/api/django";
import type { Module, Role } from "@/types/modules";

export async function fetchModules(): Promise<Module[]> {
  const { data } = await djangoApi.get<Module[]>("/admin/modules/");
  return data;
}

export async function createModule(module: Partial<Module>): Promise<Module> {
  const { data } = await djangoApi.post<Module>("/admin/modules/", module);
  return data;
}

export async function updateModule(id: number, module: Partial<Module>): Promise<Module> {
  const { data } = await djangoApi.patch<Module>(`/admin/modules/${id}/`, module);
  return data;
}

export async function deleteModule(id: number): Promise<void> {
  await djangoApi.delete(`/admin/modules/${id}/`);
}

export async function fetchRoles(): Promise<Role[]> {
  const { data } = await djangoApi.get<{ results: Role[] }>("/admin/roles/");
  return data.results;
}

export async function createRole(role: Partial<Role>): Promise<Role> {
  const { data } = await djangoApi.post<Role>("/admin/roles/", role);
  return data;
}

export async function updateRole(id: number, role: Partial<Role>): Promise<Role> {
  const { data } = await djangoApi.patch<Role>(`/admin/roles/${id}/`, role);
  return data;
}

export async function deleteRole(id: number): Promise<void> {
  await djangoApi.delete(`/admin/roles/${id}/`);
}
