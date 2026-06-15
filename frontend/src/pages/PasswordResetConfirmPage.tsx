import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { resetPasswordConfirm } from "@/services/authService";

const validationSchema = yup.object({
  new_password: yup
    .string()
    .min(8, "Mínimo 8 caracteres")
    .required("Contraseña es requerida"),
  re_new_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Las contraseñas no coinciden")
    .required("Confirmar contraseña es requerido"),
});

function PasswordResetConfirmPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: { new_password: "", re_new_password: "" },
    validationSchema,
    onSubmit: async (values, { setFieldError }) => {
      try {
        await resetPasswordConfirm(
          uid!,
          token!,
          values.new_password,
          values.re_new_password,
        );
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Error al restablecer la contraseña";
        setFieldError("new_password", msg);
      }
    },
  });

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 text-center max-w-sm w-full shadow-2xl">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Contraseña Restablecida
          </h2>
          <p className="text-gray-400 text-sm">
            Te redirigiremos al inicio de sesión...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/95 to-gray-900 z-0" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 z-10" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-red-500 text-3xl">&#9654;</span>
            <span className="text-3xl font-bold text-white tracking-tight">
              Cine<span className="text-red-500">ViewHos</span>
            </span>
          </div>
          <p className="text-gray-400 text-sm">Nueva contraseña</p>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 sm:p-8 space-y-5 shadow-2xl"
        >
          <h1 className="text-xl font-bold text-white text-center">
            Restablecer Contraseña
          </h1>

          <div>
            <label
              htmlFor="new_password"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              Nueva Contraseña
            </label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.new_password}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 transition-all"
              placeholder="••••••••"
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
              Confirmar Contraseña
            </label>
            <input
              id="re_new_password"
              name="re_new_password"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.re_new_password}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 transition-all"
              placeholder="••••••••"
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
            {formik.isSubmitting ? "Guardando..." : "Cambiar Contraseña"}
          </button>

          <div className="text-center text-sm pt-2 border-t border-gray-700/50">
            <Link
              to="/login"
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PasswordResetConfirmPage;
