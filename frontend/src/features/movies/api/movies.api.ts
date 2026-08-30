import djangoApi from "@/services/django";
import type { PaginatedResponse } from "@/services/types";
import type {
  Movie,
  MovieFormData,
  MovieList,
} from "@/features/movies/types/movie.types";

function toFormData(data: MovieFormData): FormData {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("duration_minutes", String(data.duration_minutes));
  formData.append("release_year", String(data.release_year));
  formData.append("price", String(data.price));
  formData.append("genre", String(data.genre));
  if (data.director_fk != null) {
    formData.append("director_fk", String(data.director_fk));
  }
  if (data.author_fk != null) {
    formData.append("author_fk", String(data.author_fk));
  }
  if (data.actor_fk != null) {
    formData.append("actor_fk", String(data.actor_fk));
  }
  if (data.franja_ids) {
    data.franja_ids.forEach((id) => formData.append("franja_ids", String(id)));
  }
  if (data.poster instanceof File) {
    formData.append("poster", data.poster);
  }
  return formData;
}

export async function fetchMovies(
  params?: Record<string, string | number>,
): Promise<PaginatedResponse<MovieList>> {
  const res = await djangoApi.get<PaginatedResponse<MovieList>>("/movies/", {
    params,
  });
  return res.data;
}

export async function fetchMovie(id: number): Promise<Movie> {
  const res = await djangoApi.get<Movie>(`/movies/${id}/`);
  return res.data;
}

export async function fetchAdminMovies(
  params?: Record<string, string | number>,
): Promise<PaginatedResponse<MovieList>> {
  const res = await djangoApi.get<PaginatedResponse<MovieList>>(
    "/admin/movies/",
    { params },
  );
  return res.data;
}

export async function fetchAdminMovie(id: number): Promise<Movie> {
  const res = await djangoApi.get<Movie>(`/admin/movies/${id}/`);
  return res.data;
}

export async function createMovie(data: MovieFormData): Promise<Movie> {
  const formData = toFormData(data);
  const res = await djangoApi.post<Movie>("/admin/movies/", formData);
  return res.data;
}

export async function updateMovie(
  id: number,
  data: MovieFormData,
): Promise<Movie> {
  const formData = toFormData(data);
  const res = await djangoApi.patch<Movie>(`/admin/movies/${id}/`, formData);
  return res.data;
}

export async function deleteMovie(id: number): Promise<void> {
  await djangoApi.delete(`/admin/movies/${id}/`);
}
