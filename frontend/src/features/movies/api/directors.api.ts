import djangoApi from "@/services/django";
import type { PaginatedResponse } from "@/services/types";
import type {
  Director,
  DirectorFormData,
} from "@/features/movies/types/director.types";

export async function fetchDirectors(): Promise<Director[]> {
  const res = await djangoApi.get<PaginatedResponse<Director>>("/directors/");
  return res.data.results;
}

export async function fetchAdminDirectors(): Promise<Director[]> {
  const res = await djangoApi.get<PaginatedResponse<Director>>(
    "/admin/directors/",
  );
  return res.data.results;
}

export async function createDirector(data: DirectorFormData): Promise<Director> {
  const res = await djangoApi.post<Director>("/admin/directors/", data);
  return res.data;
}

export async function updateDirector(
  id: number,
  data: DirectorFormData,
): Promise<Director> {
  const res = await djangoApi.put<Director>(`/admin/directors/${id}/`, data);
  return res.data;
}

export async function deleteDirector(id: number): Promise<void> {
  await djangoApi.delete(`/admin/directors/${id}/`);
}
