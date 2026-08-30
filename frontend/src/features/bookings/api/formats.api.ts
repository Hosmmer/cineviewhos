import djangoApi from "@/services/django";
import type { PaginatedResponse } from "@/services/types";
import type {
  Format,
  FormatFormData,
} from "@/features/bookings/types/format.types";

export async function fetchAdminFormats(): Promise<PaginatedResponse<Format>> {
  const res = await djangoApi.get<PaginatedResponse<Format>>("/admin/formats/");
  return res.data;
}

export async function fetchAdminFormat(id: number): Promise<Format> {
  const res = await djangoApi.get<Format>(`/admin/formats/${id}/`);
  return res.data;
}

export async function createFormat(data: FormatFormData): Promise<Format> {
  const res = await djangoApi.post<Format>("/admin/formats/", data);
  return res.data;
}

export async function updateFormat(
  id: number,
  data: FormatFormData,
): Promise<Format> {
  const res = await djangoApi.patch<Format>(`/admin/formats/${id}/`, data);
  return res.data;
}

export async function deleteFormat(id: number): Promise<void> {
  await djangoApi.delete(`/admin/formats/${id}/`);
}

export async function fetchFormats(): Promise<Format[]> {
  const res = await djangoApi.get<PaginatedResponse<Format>>("/formats/");
  return res.data.results;
}
