import djangoApi from "@/services/django";
import type { PaginatedResponse } from "@/services/types";
import type {
  Genre,
  GenreFormData,
} from "@/features/movies/types/genre.types";

export async function fetchGenres(): Promise<Genre[]> {
  const res = await djangoApi.get<PaginatedResponse<Genre>>("/genres/");
  return res.data.results;
}

export async function fetchAdminGenres(): Promise<Genre[]> {
  const res = await djangoApi.get<PaginatedResponse<Genre>>("/admin/genres/");
  return res.data.results;
}

export async function createGenre(data: GenreFormData): Promise<Genre> {
  const res = await djangoApi.post<Genre>("/admin/genres/", data);
  return res.data;
}

export async function updateGenre(
  id: number,
  data: GenreFormData,
): Promise<Genre> {
  const res = await djangoApi.put<Genre>(`/admin/genres/${id}/`, data);
  return res.data;
}

export async function deleteGenre(id: number): Promise<void> {
  await djangoApi.delete(`/admin/genres/${id}/`);
}
