import djangoApi from "@/api/django";
import type {
  Actor,
  ActorFormData,
  Author,
  AuthorFormData,
  Director,
  DirectorFormData,
  Genre,
  GenreFormData,
  Movie,
  MovieFormData,
  MovieList,
  PaginatedResponse,
} from "@/types/movies";

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


export async function fetchDirectors(): Promise<Director[]> {
  const res = await djangoApi.get<PaginatedResponse<Director>>("/directors/");
  return res.data.results;
}

export async function fetchAdminDirectors(): Promise<Director[]> {
  const res = await djangoApi.get<PaginatedResponse<Director>>("/admin/directors/");
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


export async function fetchActors(): Promise<Actor[]> {
  const res = await djangoApi.get<PaginatedResponse<Actor>>("/actors/");
  return res.data.results;
}

export async function fetchAdminActors(): Promise<Actor[]> {
  const res = await djangoApi.get<PaginatedResponse<Actor>>("/admin/actors/");
  return res.data.results;
}

export async function createActor(data: ActorFormData): Promise<Actor> {
  const res = await djangoApi.post<Actor>("/admin/actors/", data);
  return res.data;
}

export async function updateActor(
  id: number,
  data: ActorFormData,
): Promise<Actor> {
  const res = await djangoApi.put<Actor>(`/admin/actors/${id}/`, data);
  return res.data;
}

export async function deleteActor(id: number): Promise<void> {
  await djangoApi.delete(`/admin/actors/${id}/`);
}
