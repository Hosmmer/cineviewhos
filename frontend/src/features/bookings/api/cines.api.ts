import djangoApi from "@/services/django";
import type { PaginatedResponse } from "@/services/types";
import type {
  Cine,
  CineFormData,
  CineSchedule,
} from "@/features/bookings/types/cine.types";

export async function fetchAdminCines(): Promise<PaginatedResponse<Cine>> {
  const res = await djangoApi.get<PaginatedResponse<Cine>>("/admin/cines/");
  return res.data;
}

export async function fetchAdminCine(id: number): Promise<Cine> {
  const res = await djangoApi.get<Cine>(`/admin/cines/${id}/`);
  return res.data;
}

export async function fetchAdminCineSchedule(id: number): Promise<CineSchedule> {
  const res = await djangoApi.get<CineSchedule>(`/admin/cines/${id}/schedule/`);
  return res.data;
}

export async function createCine(data: CineFormData): Promise<Cine> {
  const res = await djangoApi.post<Cine>("/admin/cines/", data);
  return res.data;
}

export async function updateCine(id: number, data: CineFormData): Promise<Cine> {
  const res = await djangoApi.patch<Cine>(`/admin/cines/${id}/`, data);
  return res.data;
}

export async function deleteCine(id: number): Promise<void> {
  await djangoApi.delete(`/admin/cines/${id}/`);
}
