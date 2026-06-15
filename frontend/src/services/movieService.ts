import djangoApi from "@/api/django";
import type {
  Movie,
  MovieList,
  Genre,
  MovieFormData,
  GenreFormData,
  PaginatedResponse,
} from "@/types/movies";

function toFormData(data: MovieFormData): FormData {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("director", data.director);
  formData.append("actors", data.actors);
  formData.append("duration_minutes", String(data.duration_minutes));
  formData.append("release_year", String(data.release_year));
  formData.append("price", String(data.price));
  formData.append("genre", String(data.genre));
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
