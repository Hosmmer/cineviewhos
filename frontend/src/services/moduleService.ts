import djangoApi from "@/api/django";
import type { Module } from "@/types/modules";

export async function fetchModules(): Promise<Module[]> {
  const { data } = await djangoApi.get<Module[]>("/admin/modules/");
  return data;
}
