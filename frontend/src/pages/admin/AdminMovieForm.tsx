import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  fetchAdminMovie,
  createMovie,
  updateMovie,
  fetchAdminGenres,
  fetchAdminDirectors,
  fetchAdminAuthors,
  fetchAdminActors,
  fetchMovieDisplayConfig,
  updateMovieDisplayConfig,
} from "@/services/movieService";
import type { Director, Author, Actor } from "@/types/movies";

const currentYear = new Date().getFullYear();

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required").min(1).max(255),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Must be at least 10 characters"),
  duration_minutes: Yup.number()
    .required("Duration is required")
    .min(1, "Minimum 1 minute")
    .max(600, "Maximum 600 minutes")
    .typeError("Must be a number"),
  release_year: Yup.number()
    .required("Year is required")
    .min(1900, "Minimum year is 1900")
    .max(currentYear + 5, `Maximum year is ${currentYear + 5}`)
    .typeError("Must be a number"),
  price: Yup.number()
    .required("Price is required")
    .min(0, "Price cannot be negative")
    .typeError("Must be a number"),
  genre: Yup.number()
    .required("Genre is required")
    .min(1, "Select a genre")
    .typeError("Select a genre"),
  director_fk: Yup.number().nullable().typeError("Select a director"),
  author_fk: Yup.number().nullable().typeError("Select an author"),
  actor_fk: Yup.number().nullable().typeError("Select an actor"),
});

function AdminMovieForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  const { data: genres } = useQuery({
    queryKey: ["admin-genres"],
    queryFn: fetchAdminGenres,
  });

  const { data: directors } = useQuery<Director[]>({
    queryKey: ["admin-directors"],
    queryFn: fetchAdminDirectors,
  });

  const { data: authors } = useQuery<Author[]>({
    queryKey: ["admin-authors"],
    queryFn: fetchAdminAuthors,
  });

  const { data: actors } = useQuery<Actor[]>({
    queryKey: ["admin-actors"],
    queryFn: fetchAdminActors,
  });

  const { data: movie, isLoading: movieLoading } = useQuery({
    queryKey: ["admin-movie", id],
    queryFn: () => fetchAdminMovie(Number(id)),
    enabled: isEdit,
  });

  const { data: displayConfig } = useQuery({
    queryKey: ["admin-movie-display-config", id],
    queryFn: () => fetchMovieDisplayConfig(Number(id)),
    enabled: isEdit,
  });

  const [showDirector, setShowDirector] = useState(true);
  const [showAuthor, setShowAuthor] = useState(true);
  const [showActor, setShowActor] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [showDuration, setShowDuration] = useState(true);
  const [showReleaseYear, setShowReleaseYear] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showGenre, setShowGenre] = useState(true);
  const [dcSaving, setDcSaving] = useState(false);
  const [dcError, setDcError] = useState<string | null>(null);

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

  const createMutation = useMutation({
    mutationFn: createMovie,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-movies"] });
      navigate("/movies");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateMovie>[1]) =>
      updateMovie(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-movies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-movie", id] });
      navigate("/movies");
    },
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      duration_minutes: "" as unknown as number,
      release_year: "" as unknown as number,
      price: "" as unknown as number,
      genre: "" as unknown as number,
      director_fk: null as number | null,
      author_fk: null as number | null,
      actor_fk: null as number | null,
      poster: null as File | null,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const data = { ...values, poster: values.poster || undefined };
      if (isEdit) {
        updateMutation.mutate(data);
      } else {
        createMutation.mutate(data);
      }
    },
  });

  useEffect(() => {
    if (isEdit && movie) {
      formik.setValues({
        title: movie.title,
        description: movie.description,
        duration_minutes: movie.duration_minutes,
        release_year: movie.release_year,
        price: Number(movie.price),
        genre: movie.genre,
        director_fk: movie.director_fk,
        author_fk: movie.author_fk,
        actor_fk: movie.actor_fk,
        poster: null,
      });
      if (movie.poster) {
        setPosterPreview(movie.poster);
      }
    }
  }, [isEdit, movie]);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      formik.setFieldValue("poster", file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const serverError = (createMutation.error || updateMutation.error) as {
    response?: { data?: Record<string, string[]> };
  } | null;

  useEffect(() => {
    if (serverError?.response?.data) {
      Object.entries(serverError.response.data).forEach(([key, messages]) => {
        if (key !== "detail" && Array.isArray(messages)) {
          formik.setFieldError(key, messages[0]);
        }
      });
    }
  }, [serverError]);

  const handleDcSave = async () => {
    setDcSaving(true);
    setDcError(null);
    try {
      await updateMovieDisplayConfig(Number(id), {
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
        queryKey: ["admin-movie-display-config", id],
      });
    } catch (err: any) {
      setDcError(
        err?.response?.data?.detail || "Failed to save display config.",
      );
    } finally {
      setDcSaving(false);
    }
  };

  if (isEdit && movieLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isEdit && !movie) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Movie not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">
        {isEdit ? "Edit Movie" : "New Movie"}
      </h1>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              {...formik.getFieldProps("title")}
              className={`w-full bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5 border ${
                formik.touched.title && formik.errors.title
                  ? "border-red-500"
                  : "border-gray-700 focus:border-red-500"
              } focus:outline-none focus:ring-1 focus:ring-red-500`}
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-xs text-red-400 mt-1">{formik.errors.title}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="director_fk"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Director
            </label>
            <select
              id="director_fk"
              {...formik.getFieldProps("director_fk")}
              value={formik.values.director_fk ?? ""}
              onChange={(e) =>
                formik.setFieldValue(
                  "director_fk",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              className={`w-full bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5 border ${
                formik.touched.director_fk && formik.errors.director_fk
                  ? "border-red-500"
                  : "border-gray-700 focus:border-red-500"
              } focus:outline-none focus:ring-1 focus:ring-red-500`}
            >
              <option value="">No director</option>
              {directors?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {formik.touched.director_fk && formik.errors.director_fk && (
              <p className="text-xs text-red-400 mt-1">
                {formik.errors.director_fk}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            {...formik.getFieldProps("description")}
            className={`w-full bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5 border ${
              formik.touched.description && formik.errors.description
                ? "border-red-500"
                : "border-gray-700 focus:border-red-500"
            } focus:outline-none focus:ring-1 focus:ring-red-500 resize-none`}
          />
          {formik.touched.description && formik.errors.description && (
            <p className="text-xs text-red-400 mt-1">
              {formik.errors.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="author_fk"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Author
            </label>
            <select
              id="author_fk"
              {...formik.getFieldProps("author_fk")}
              value={formik.values.author_fk ?? ""}
              onChange={(e) =>
                formik.setFieldValue(
                  "author_fk",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              className={`w-full bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5 border ${
                formik.touched.author_fk && formik.errors.author_fk
                  ? "border-red-500"
                  : "border-gray-700 focus:border-red-500"
              } focus:outline-none focus:ring-1 focus:ring-red-500`}
            >
              <option value="">No author</option>
              {authors?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            {formik.touched.author_fk && formik.errors.author_fk && (
              <p className="text-xs text-red-400 mt-1">
                {formik.errors.author_fk}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="actor_fk"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Actor
            </label>
            <select
              id="actor_fk"
              {...formik.getFieldProps("actor_fk")}
              value={formik.values.actor_fk ?? ""}
              onChange={(e) =>
                formik.setFieldValue(
                  "actor_fk",
                  e.target.value ? Number(e.target.value) : null,
                )
              }
              className={`w-full bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5 border ${
                formik.touched.actor_fk && formik.errors.actor_fk
                  ? "border-red-500"
                  : "border-gray-700 focus:border-red-500"
              } focus:outline-none focus:ring-1 focus:ring-red-500`}
            >
              <option value="">No actor</option>
              {actors?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            {formik.touched.actor_fk && formik.errors.actor_fk && (
              <p className="text-xs text-red-400 mt-1">
                {formik.errors.actor_fk}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="genre"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Genre
            </label>
            <select
              id="genre"
              {...formik.getFieldProps("genre")}
              className={`w-full bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5 border ${
                formik.touched.genre && formik.errors.genre
                  ? "border-red-500"
                  : "border-gray-700 focus:border-red-500"
              } focus:outline-none focus:ring-1 focus:ring-red-500`}
            >
              <option value="">Select genre...</option>
              {genres?.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            {formik.touched.genre && formik.errors.genre && (
              <p className="text-xs text-red-400 mt-1">{formik.errors.genre}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="duration_minutes"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Duration (min)
            </label>
            <input
              id="duration_minutes"
              type="number"
              {...formik.getFieldProps("duration_minutes")}
              className={`w-full bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5 border ${
                formik.touched.duration_minutes &&
                formik.errors.duration_minutes
                  ? "border-red-500"
                  : "border-gray-700 focus:border-red-500"
              } focus:outline-none focus:ring-1 focus:ring-red-500`}
            />
            {formik.touched.duration_minutes &&
              formik.errors.duration_minutes && (
                <p className="text-xs text-red-400 mt-1">
                  {formik.errors.duration_minutes}
                </p>
              )}
          </div>
          <div>
            <label
              htmlFor="release_year"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Release Year
            </label>
            <input
              id="release_year"
              type="number"
              {...formik.getFieldProps("release_year")}
              className={`w-full bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5 border ${
                formik.touched.release_year && formik.errors.release_year
                  ? "border-red-500"
                  : "border-gray-700 focus:border-red-500"
              } focus:outline-none focus:ring-1 focus:ring-red-500`}
            />
            {formik.touched.release_year && formik.errors.release_year && (
              <p className="text-xs text-red-400 mt-1">
                {formik.errors.release_year}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Price
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              {...formik.getFieldProps("price")}
              className={`w-full bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5 border ${
                formik.touched.price && formik.errors.price
                  ? "border-red-500"
                  : "border-gray-700 focus:border-red-500"
              } focus:outline-none focus:ring-1 focus:ring-red-500`}
            />
            {formik.touched.price && formik.errors.price && (
              <p className="text-xs text-red-400 mt-1">{formik.errors.price}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="poster"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Poster (JPG/PNG/WebP, max 5MB)
            </label>
            <input
              id="poster"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handlePosterChange}
              className={`w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-700 file:text-gray-300 hover:file:bg-gray-600 ${
                formik.touched.poster && formik.errors.poster
                  ? "!text-red-400"
                  : ""
              }`}
            />
            {posterPreview && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Preview:</p>
                <img
                  src={posterPreview}
                  alt="Poster preview"
                  className="w-24 h-36 object-cover rounded-lg border border-gray-700"
                />
              </div>
            )}
            {formik.touched.poster && formik.errors.poster && (
              <p className="text-xs text-red-400 mt-1">
                {String(formik.errors.poster)}
              </p>
            )}
          </div>
        </div>

        {serverError?.response?.data?.detail && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg px-4 py-3">
            {serverError.response.data.detail}
          </p>
        )}

        {isEdit && (
          <div className="border-t border-gray-800 pt-5">
            <h2 className="text-lg font-semibold text-white mb-4">
              Display Configuration
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Toggle which fields are visible on the public movie detail page.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ["Director", showDirector, setShowDirector],
                ["Author", showAuthor, setShowAuthor],
                ["Actor", showActor, setShowActor],
                ["Description", showDescription, setShowDescription],
                ["Duration", showDuration, setShowDuration],
                ["Release Year", showReleaseYear, setShowReleaseYear],
                ["Price", showPrice, setShowPrice],
                ["Genre", showGenre, setShowGenre],
              ].map(([label, value, setter]) => (
                <label
                  key={label as string}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={value as boolean}
                    onChange={(e) =>
                      (setter as (v: boolean) => void)(e.target.checked)
                    }
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-red-600 focus:ring-red-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-300">{label as string}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleDcSave}
                disabled={dcSaving}
                className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {dcSaving ? "Saving..." : "Save Display Config"}
              </button>
              {dcError && (
                <p className="text-xs text-red-400">{dcError}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={() => navigate("/movies")}
            className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
          >
            {isPending ? "Saving..." : isEdit ? "Update Movie" : "Create Movie"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminMovieForm;
