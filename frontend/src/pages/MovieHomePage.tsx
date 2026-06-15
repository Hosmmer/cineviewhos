import { useQuery } from "@tanstack/react-query";
import { fetchMovies } from "@/services/movieService";
import MovieCard from "@/components/MovieCard";
import type { PaginatedResponse, MovieList } from "@/types/movies";
import djangoApi from "@/api/django";

interface HealthResponse {
  status: string;
}

function MovieHomePage() {
  const { data: health } = useQuery<HealthResponse>({
    queryKey: ["django-health"],
    queryFn: () => djangoApi.get("/health/").then((r) => r.data),
  });

  const { data, isLoading, error } = useQuery<PaginatedResponse<MovieList>>({
    queryKey: ["public-movies"],
    queryFn: () => fetchMovies({ ordering: "-created_at" }),
  });

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700/50 p-8 sm:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-red-500 text-2xl">&#9654;</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              CineViewHos
            </h1>
          </div>
          <p className="text-gray-400 text-lg mb-6">
            Tu plataforma de peliculas
          </p>
          {health && (
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${health.status === "ok" ? "bg-green-400" : "bg-red-400"}`}
              />
              <span
                className={`text-sm font-medium ${health.status === "ok" ? "text-green-400" : "text-red-400"}`}
              >
                {health.status === "ok"
                  ? "Backend conectado"
                  : "Backend offline"}
              </span>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div
              key={i}
              className="aspect-[2/3] bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">Failed to load movies.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : data && data.results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 text-gray-700 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
            />
          </svg>
          <p className="text-gray-500 text-lg">No movies available yet.</p>
          <p className="text-gray-600 text-sm mt-1">
            Check back soon for new releases.
          </p>
        </div>
      )}
    </div>
  );
}

export default MovieHomePage;
