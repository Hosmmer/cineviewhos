import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminMovies,
  fetchMovieDisplayConfig,
  updateMovieDisplayConfig,
} from "@/services/movieService";
import type { MovieList } from "@/types/movies";

function AdminMovieDisplayConfig() {
  const queryClient = useQueryClient();
  const [selectedMovieId, setSelectedMovieId] = useState<number>(0);
  const [showDirector, setShowDirector] = useState(true);
  const [showAuthor, setShowAuthor] = useState(true);
  const [showActor, setShowActor] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [showDuration, setShowDuration] = useState(true);
  const [showReleaseYear, setShowReleaseYear] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showGenre, setShowGenre] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: moviesData, isLoading: moviesLoading } = useQuery({
    queryKey: ["admin-movies", 1, ""],
    queryFn: () => fetchAdminMovies({ page: 1, search: "" }),
  });

  const movies = moviesData?.results ?? [];

  const { data: displayConfig, isLoading: dcLoading } = useQuery({
    queryKey: ["admin-movie-display-config", selectedMovieId],
    queryFn: () => fetchMovieDisplayConfig(selectedMovieId),
    enabled: selectedMovieId > 0,
  });

  useEffect(() => {
    if (displayConfig) {
      setShowDirector(displayConfig.show_director);
      setShowAuthor(displayConfig.show_author);
      setShowActor(displayConfig.show_actor);
      setShowDescription(displayConfig.show_description);
      setShowDuration(displayConfig.show_duration);
      setShowReleaseYear(displayConfig.show_release_year);
      setShowPrice(displayConfig.show_price);
      setShowGenre(displayConfig.show_genre);
    }
  }, [displayConfig]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateMovieDisplayConfig(selectedMovieId, {
        show_director: showDirector,
        show_author: showAuthor,
        show_actor: showActor,
        show_description: showDescription,
        show_duration: showDuration,
        show_release_year: showReleaseYear,
        show_price: showPrice,
        show_genre: showGenre,
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-movie-display-config", selectedMovieId],
      });
      queryClient.invalidateQueries({ queryKey: ["movie", selectedMovieId] });
      queryClient.invalidateQueries({ queryKey: ["public-movies"] });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">
        Display Configuration
      </h1>

      <div className="max-w-2xl">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Movie
          </label>
          {moviesLoading ? (
            <div className="h-10 bg-gray-800 rounded animate-pulse" />
          ) : (
            <select
              value={selectedMovieId}
              onChange={(e) => {
                setSelectedMovieId(Number(e.target.value));
                setError(null);
                setSuccess(false);
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
            >
              <option value={0}>Seleccionar pelicula...</option>
              {movies.map((m: MovieList) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedMovieId > 0 && (
          <>
            {dcLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-8 bg-gray-800 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-4">
                  Toggle which fields are visible on the public movie detail
                  page.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Director", showDirector, setShowDirector],
                    ["Autor", showAuthor, setShowAuthor],
                    ["Actor", showActor, setShowActor],
                    ["Sinopsis", showDescription, setShowDescription],
                    ["Duracion", showDuration, setShowDuration],
                    ["Año del estreno", showReleaseYear, setShowReleaseYear],
                    ["Precio", showPrice, setShowPrice],
                    ["Genero", showGenre, setShowGenre],
                  ].map(([label, value, setter]) => (
                    <label
                      key={label as string}
                      className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg cursor-pointer hover:border-gray-600 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={value as boolean}
                        onChange={(e) =>
                          (setter as (v: boolean) => void)(e.target.checked)
                        }
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-gray-200">
                        {label as string}
                      </span>
                    </label>
                  ))}
                </div>

                {error && (
                  <p className="mt-4 text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg px-4 py-3">
                    {error}
                  </p>
                )}

                {success && (
                  <p className="mt-4 text-sm text-emerald-400 bg-emerald-900/20 border border-emerald-900/50 rounded-lg px-4 py-3">
                    Display config updated successfully.
                  </p>
                )}

                <div className="mt-6">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {saving ? "Guardando..." : "Guardar Configuracion"}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {selectedMovieId === 0 && !moviesLoading && (
          <p className="text-gray-500 text-sm">
            Selecciona una pelicula para configurar su visibilidad de campos.
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminMovieDisplayConfig;
