import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminMovies, deleteMovie } from "@/services/movieService";
import type { PaginatedResponse, MovieList } from "@/types/movies";

function formatPrice(price: string): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(price));
}

function AdminMovieList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const page = searchParams.get("page") || "1";
  const search = searchParams.get("search") || "";

  const { data, isLoading, error } = useQuery<PaginatedResponse<MovieList>>({
    queryKey: ["admin-movies", page, search],
    queryFn: () => fetchAdminMovies({ page: Number(page), search }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMovie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-movies"] });
      setDeleteId(null);
    },
  });

  const handleSearch = (value: string) => {
    const params = new URLSearchParams();
    if (value) params.set("search", value);
    setSearchParams(params);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-800 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Failed to load movies.</p>
        <button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["admin-movies"] })
          }
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Movies</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Search by title or director..."
              defaultValue={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full sm:w-64 bg-gray-800 text-gray-200 text-sm rounded-lg pl-10 pr-4 py-2 border border-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-gray-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={() => navigate("/admin/movies/create")}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium whitespace-nowrap"
          >
            + New Movie
          </button>
        </div>
      </div>

      <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3 w-16">
                Poster
              </th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                Title
              </th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                Genre
              </th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                Director
              </th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                Year
              </th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                Duration
              </th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                Price
              </th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                Active
              </th>
              <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {data && data.results.length > 0 ? (
              data.results.map((movie) => (
                <tr key={movie.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    {movie.poster ? (
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-12 h-[72px] object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-[72px] bg-gray-800 rounded flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-white font-medium">
                    {movie.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {movie.genre_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {movie.director}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {movie.release_year}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {movie.duration_minutes} min
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {formatPrice(movie.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        movie.is_active
                          ? "bg-green-900/30 text-green-400 border border-green-900/50"
                          : "bg-red-900/30 text-red-400 border border-red-900/50"
                      }`}
                    >
                      {movie.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          navigate(`/admin/movies/${movie.id}/edit`)
                        }
                        className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(movie.id)}
                        className="px-3 py-1 text-xs bg-red-900/50 text-red-400 rounded hover:bg-red-900 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  No movies found. Create your first movie to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.count > 20 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Showing {(Number(page) - 1) * 20 + 1}-
            {Math.min(Number(page) * 20, data.count)} of {data.count}
          </p>
          <div className="flex gap-2">
            <button
              disabled={!data.previous}
              onClick={() =>
                setSearchParams((prev) => {
                  prev.set("page", String(Number(page) - 1));
                  return prev;
                })
              }
              className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded disabled:opacity-40 hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              disabled={!data.next}
              onClick={() =>
                setSearchParams((prev) => {
                  prev.set("page", String(Number(page) + 1));
                  return prev;
                })
              }
              className="px-3 py-1 text-sm bg-gray-800 text-gray-300 rounded disabled:opacity-40 hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Delete Movie
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              This will deactivate the movie. It will no longer appear on the
              home page but can be reactivated later.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMovieList;
