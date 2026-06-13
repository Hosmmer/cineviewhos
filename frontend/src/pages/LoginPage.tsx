import { useNavigate, Link } from 'react-router-dom'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useAuth } from '@/contexts/AuthContext'

const validationSchema = yup.object({
  username: yup.string().required('Usuario o email es requerido'),
  password: yup.string().required('Contraseña es requerida'),
})

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const formik = useFormik({
    initialValues: { username: '', password: '' },
    validationSchema,
    onSubmit: async (values, { setFieldError }) => {
      try {
        await login(values)
        navigate('/')
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Credenciales inválidas'
        setFieldError('password', msg)
      }
    },
  })

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/95 to-gray-900 z-0" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 z-10" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-red-500 text-3xl">&#9654;</span>
            <span className="text-3xl font-bold text-white tracking-tight">Cine<span className="text-red-500">ViewHos</span></span>
          </div>
          <p className="text-gray-400 text-sm">Tu plataforma de películas</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 sm:p-8 space-y-5 shadow-2xl">
          <h1 className="text-xl font-bold text-white text-center">Iniciar Sesión</h1>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1.5">Usuario o Email</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.username}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 transition-all"
              placeholder="usuario@email.com"
            />
            {formik.touched.username && formik.errors.username && (
              <p className="text-red-400 text-xs mt-1">{formik.errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 transition-all"
              placeholder="••••••••"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-400 text-xs mt-1">{formik.errors.password}</p>
            )}
          </div>

          {formik.submitCount > 0 && formik.isSubmitting === false && !formik.isValid && (
            <p className="text-red-400 text-xs text-center">Por favor corrige los errores del formulario</p>
          )}

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-600/25"
          >
            {formik.isSubmitting ? 'Entrando...' : 'Iniciar Sesión'}
          </button>

          <div className="text-center text-sm space-y-3 pt-2">
            <Link to="/password/reset" className="text-gray-400 hover:text-red-400 transition-colors block">¿Olvidaste tu contraseña?</Link>
            <div className="border-t border-gray-700/50 pt-3">
              <span className="text-gray-500">¿No tienes cuenta? </span>
              <Link to="/register" className="text-red-400 hover:text-red-300 font-medium transition-colors">Regístrate</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
