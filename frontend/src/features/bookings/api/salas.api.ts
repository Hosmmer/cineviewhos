import djangoApi from "@/services/django";
import type { PaginatedResponse } from "@/services/types";
import type {
  Sala,
  SalaDetail,
  SalaFormData,
} from "@/features/bookings/types/sala.types";

export async function fetchAdminSalas(): Promise<PaginatedResponse<SalaDetail>> {
  const res = await djangoApi.get<PaginatedResponse<SalaDetail>>(
    "/admin/salas/",
  );
  return res.data;
}

export async function fetchAdminSala(id: number): Promise<Sala> {
  const res = await djangoApi.get<Sala>(`/admin/salas/${id}/`);
  return res.data;
}

export async function createSala(data: SalaFormData): Promise<Sala> {
  const res = await djangoApi.post<Sala>("/admin/salas/", data);
  return res.data;
}

export async function updateSala(
  id: number,
  data: { cine: number; number: number },
): Promise<Sala> {
  const res = await djangoApi.patch<Sala>(`/admin/salas/${id}/`, data);
  return res.data;
}

export async function deleteSala(id: number): Promise<void> {
  await djangoApi.delete(`/admin/salas/${id}/`);
}
