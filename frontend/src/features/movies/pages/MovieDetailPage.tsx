import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { fetchMovie } from "@/features/movies/api/movies.api";
import { fetchFunciones } from "@/features/bookings/api/funciones.api";
import type { Movie } from "@/features/movies/types/movie.types";
import { Clock } from "lucide-react";
import MovieShowtimes from "@/features/movies/components/MovieShowtimes";
import { formatPrice } from "@/utils/format";

function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: movie, isLoading: movieLoading } = useQuery<Movie>({
    queryKey: ["movie", id],
    queryFn: () => fetchMovie(Number(id)),
    enabled: !!id,
    staleTime: 0,
  });

  const { data: funcionesData, isLoading: funcionesLoading } = useQuery({
    queryKey: ["funciones", id],
    queryFn: () => fetchFunciones(Number(id)),
    enabled: !!id,
    staleTime: 0,
  });

  const funciones = funcionesData?.results ?? [];

  if (movieLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-800 rounded" />
          <div className="h-96 bg-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 text-lg">Pelicula no encontrada.</p>
      </div>
    );
  }

  const dc = movie.display_config;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <div className="aspect-[2/3] bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden">
              {movie.poster ? (
                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 space-y-3">
              {(!dc || dc.show_director) && movie.director_name && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Director</p>
                  <p className="text-gray-300 text-sm">{movie.director_name}</p>
                </div>
              )}
              {(!dc || dc.show_author) && movie.author_name && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Autor</p>
                  <p className="text-gray-300 text-sm">{movie.author_name}</p>
                </div>
              )}
              {(!dc || dc.show_actor) && movie.actor_name && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Actor</p>
                  <p className="text-gray-300 text-sm">{movie.actor_name}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
              {(!dc || dc.show_genre) && movie.genre_name && (
                <span className="px-2.5 py-1 bg-red-600/10 text-red-400 border border-red-600/30 rounded-full text-xs font-medium">
                  {movie.genre_name}
                </span>
              )}
              {(!dc || dc.show_duration) && (
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {movie.duration_minutes} min
                </span>
              )}
              {(!dc || dc.show_release_year) && (
                <span className="text-gray-400">{movie.release_year}</span>
              )}
              {(!dc || dc.show_price) && (
                <span className="text-red-400 font-semibold">{formatPrice(movie.price)}</span>
              )}
            </div>
          </div>

          {(!dc || dc.show_description) && (
            <p className="text-gray-300 leading-relaxed">{movie.description}</p>
          )}

          <div className="border-t border-gray-700/50 pt-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-400" />
              Horarios disponibles
            </h2>

            {funcionesLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-5 w-24 bg-gray-800 rounded animate-pulse" />
                    <div className="flex gap-2 flex-wrap">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-10 w-24 bg-gray-800 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <MovieShowtimes movieId={id!} funciones={funciones} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetailPage;
