import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { changePassword } from "@/services/authService";
import { ArrowLeft } from "lucide-react";

const validationSchema = yup.object({
  current_password: yup.string().required("Contrasena actual requerida"),
  new_password: yup
    .string()
    .required("Nueva contrasena requerida")
    .min(8, "Minimo 8 caracteres"),
  re_new_password: yup
    .string()
    .required("Confirma tu nueva contrasena")
    .oneOf([yup.ref("new_password")], "Las contrasenas no coinciden"),
});

function ChangePasswordPage() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      current_password: "",
      new_password: "",
      re_new_password: "",
    },
    validationSchema,
    onSubmit: async (values, { setFieldError }) => {
      try {
        await changePassword(
          values.current_password,
          values.new_password,
          values.re_new_password,
        );
        navigate("/");
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Error al cambiar contrasena";
        setFieldError("current_password", msg);
      }
    },
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/95 to-gray-900 z-0" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 z-10" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 sm:p-8 space-y-5 shadow-2xl"
        >
          <h1 className="text-xl font-bold text-white text-center">
            Cambiar Contrasena
          </h1>

          <div>
            <label
              htmlFor="current_password"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              Contrasena Actual
            </label>
            <input
              id="current_password"
              name="current_password"
              type="password"
              autoComplete="current-password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.current_password}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 transition-all"
              placeholder="........"
            />
            {formik.touched.current_password &&
              formik.errors.current_password && (
                <p className="text-red-400 text-xs mt-1">
                  {formik.errors.current_password}
                </p>
              )}
          </div>

          <div>
            <label
              htmlFor="new_password"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              Nueva Contrasena
            </label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              autoComplete="new-password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.new_password}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 transition-all"
              placeholder="........"
            />
            {formik.touched.new_password && formik.errors.new_password && (
              <p className="text-red-400 text-xs mt-1">
                {formik.errors.new_password}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="re_new_password"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              Confirmar Nueva Contrasena
            </label>
            <input
              id="re_new_password"
              name="re_new_password"
              type="password"
              autoComplete="new-password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.re_new_password}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 transition-all"
              placeholder="........"
            />
            {formik.touched.re_new_password &&
              formik.errors.re_new_password && (
                <p className="text-red-400 text-xs mt-1">
                  {formik.errors.re_new_password}
                </p>
              )}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-600/25"
          >
            {formik.isSubmitting ? "Cambiando..." : "Cambiar Contrasena"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
