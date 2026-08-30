import djangoApi from "@/services/django";
import type { PaginatedResponse } from "@/services/types";
import type {
  Franja,
  FranjaFormData,
} from "@/features/bookings/types/franja.types";

export async function fetchAdminFranjas(): Promise<PaginatedResponse<Franja>> {
  const res = await djangoApi.get<PaginatedResponse<Franja>>("/admin/franjas/");
  return res.data;
}

export async function fetchAdminFranja(id: number): Promise<Franja> {
  const res = await djangoApi.get<Franja>(`/admin/franjas/${id}/`);
  return res.data;
}

export async function createFranja(data: FranjaFormData): Promise<Franja> {
  const res = await djangoApi.post<Franja>("/admin/franjas/", data);
  return res.data;
}

export async function updateFranja(
  id: number,
  data: FranjaFormData,
): Promise<Franja> {
  const res = await djangoApi.patch<Franja>(`/admin/franjas/${id}/`, data);
  return res.data;
}

export async function deleteFranja(id: number): Promise<void> {
  await djangoApi.delete(`/admin/franjas/${id}/`);
}
