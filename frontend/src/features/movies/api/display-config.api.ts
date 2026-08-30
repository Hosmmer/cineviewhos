import djangoApi from "@/services/django";
import type { MovieDisplayConfig } from "@/features/movies/types/movie.types";

export async function fetchMovieDisplayConfig(
  movieId: number,
): Promise<MovieDisplayConfig> {
  const res = await djangoApi.get<MovieDisplayConfig>(
    `/admin/movies/${movieId}/display-config/`,
  );
  return res.data;
}

export async function updateMovieDisplayConfig(
  movieId: number,
  data: Partial<MovieDisplayConfig>,
): Promise<MovieDisplayConfig> {
  const res = await djangoApi.patch<MovieDisplayConfig>(
    `/admin/movies/${movieId}/display-config/`,
    data,
  );
  return res.data;
}
