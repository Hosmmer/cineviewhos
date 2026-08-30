import djangoApi from "@/services/django";
import type { PaginatedResponse } from "@/services/types";
import type { Author, AuthorFormData } from "@/features/movies/types/author.types";

export async function fetchAuthors(): Promise<Author[]> {
  const res = await djangoApi.get<PaginatedResponse<Author>>("/authors/");
  return res.data.results;
}

export async function fetchAdminAuthors(): Promise<Author[]> {
  const res = await djangoApi.get<PaginatedResponse<Author>>("/admin/authors/");
  return res.data.results;
}

export async function createAuthor(data: AuthorFormData): Promise<Author> {
  const res = await djangoApi.post<Author>("/admin/authors/", data);
  return res.data;
}

export async function updateAuthor(
  id: number,
  data: AuthorFormData,
): Promise<Author> {
  const res = await djangoApi.put<Author>(`/admin/authors/${id}/`, data);
  return res.data;
}

export async function deleteAuthor(id: number): Promise<void> {
  await djangoApi.delete(`/admin/authors/${id}/`);
}
