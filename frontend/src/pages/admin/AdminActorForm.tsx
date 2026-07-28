import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  fetchAdminActors,
  createActor,
  updateActor,
} from "@/services/movieService";
import type { Actor } from "@/types/movies";

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Actor name is required")
    .min(1, "Must be at least 1 character")
    .max(255, "Must be 255 characters or fewer"),
  birth_date: Yup.string().nullable(),
  city: Yup.string().max(255, "Must be 255 characters or fewer"),
});

function AdminActorForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: actors } = useQuery<Actor[]>({
    queryKey: ["admin-actors"],
    queryFn: fetchAdminActors,
  });

  const existingActor = isEdit
    ? actors?.find((a) => a.id === Number(id))
    : undefined;

  const createMutation = useMutation({
    mutationFn: createActor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-actors"] });
      navigate("/movies/actors");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; birth_date: string; city: string }) =>
      updateActor(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-actors"] });
      navigate("/movies/actors");
    },
  });

  const formik = useFormik({
    initialValues: { name: "", birth_date: "", city: "" },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (isEdit) {
        updateMutation.mutate(values);
      } else {
        createMutation.mutate(values);
      }
    },
  });

  useEffect(() => {
    if (isEdit && existingActor) {
      formik.setValues({
        name: existingActor.name,
        birth_date: existingActor.birth_date || "",
        city: existingActor.city || "",
      });
    }
  }, [isEdit, existingActor]);

  const isPending = createMutation.isPending || updateMutation.isPending;
  const serverError = (createMutation.error || updateMutation.error) as {
    response?: { data?: { detail?: string; name?: string[] } };
  } | null;

  useEffect(() => {
    if (serverError?.response?.data?.name) {
      formik.setFieldError("name", serverError.response.data.name[0]);
    }
  }, [serverError]);

  if (isEdit && !existingActor) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">
        {isEdit ? "Edit Actor" : "New Actor"}
      </h1>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            {...formik.getFieldProps("name")}
            className={`w-full bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5 border ${
              formik.touched.name && formik.errors.name
                ? "border-red-500"
                : "border-gray-700 focus:border-red-500"
            } focus:outline-none focus:ring-1 focus:ring-red-500`}
            placeholder="Robert Downey Jr."
          />
          {formik.touched.name && formik.errors.name && (
            <p className="text-xs text-red-400 mt-1">{formik.errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="birth_date"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Birth Date
          </label>
          <input
            id="birth_date"
            type="date"
            {...formik.getFieldProps("birth_date")}
            className={`w-full bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5 border ${
              formik.touched.birth_date && formik.errors.birth_date
                ? "border-red-500"
                : "border-gray-700 focus:border-red-500"
            } focus:outline-none focus:ring-1 focus:ring-red-500`}
          />
          {formik.touched.birth_date && formik.errors.birth_date && (
            <p className="text-xs text-red-400 mt-1">
              {formik.errors.birth_date}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            City
          </label>
          <input
            id="city"
            type="text"
            {...formik.getFieldProps("city")}
            className={`w-full bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5 border ${
              formik.touched.city && formik.errors.city
                ? "border-red-500"
                : "border-gray-700 focus:border-red-500"
            } focus:outline-none focus:ring-1 focus:ring-red-500`}
            placeholder="New York"
          />
          {formik.touched.city && formik.errors.city && (
            <p className="text-xs text-red-400 mt-1">{formik.errors.city}</p>
          )}
        </div>

        {serverError && !serverError.response?.data?.name && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg px-4 py-3">
            {serverError.response?.data?.detail || "An error occurred."}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/movies/actors")}
            className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
          >
            {isPending
              ? "Saving..."
              : isEdit
                ? "Update Actor"
                : "Create Actor"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminActorForm;
