import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useAuth } from '@/contexts/AuthContext'

const validationSchema = yup.object({
  username: yup.string().min(3, 'Mínimo 3 caracteres').required('Usuario es requerido'),
  email: yup.string().email('Email inválido').required('Email es requerido'),
  password: yup.string().min(8, 'Mínimo 8 caracteres').required('Contraseña es requerida'),
  re_password: yup.string()
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirmar contraseña es requerido'),
  first_name: yup.string(),
  last_name: yup.string(),
})

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [success, setSuccess] = useState(false)

  const formik = useFormik({
    initialValues: { username: '', email: '', password: '', re_password: '', first_name: '', last_name: '' },
    validationSchema,
    onSubmit: async (values, { setFieldError }) => {
      try {
        await register(values)
        setSuccess(true)
        setTimeout(() => navigate('/login'), 2000)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al registrarse'
        setFieldError('email', msg)
      }
    },
  })

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 text-center max-w-sm w-full shadow-2xl">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Registro Exitoso</h2>
          <p className="text-gray-400 text-sm">Te redirigiremos al inicio de sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/95 to-gray-900 z-0" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 z-10" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-red-500 text-3xl">&#9654;</span>
            <span className="text-3xl font-bold text-white tracking-tight">Cine<span className="text-red-500">ViewHos</span></span>
          </div>
          <p className="text-gray-400 text-sm">Crea tu cuenta</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 sm:p-8 space-y-4 shadow-2xl">
          <h1 className="text-xl font-bold text-white text-center">Crear Cuenta</h1>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1.5">Usuario *</label>
            <input id="username" name="username" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.username}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 transition-all" placeholder="usuario123" />
            {formik.touched.username && formik.errors.username && <p className="text-red-400 text-xs mt-1">{formik.errors.username}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">Email *</label>
            <input id="email" name="email" type="email" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.email}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 transition-all" placeholder="correo@ejemplo.com" />
            {formik.touched.email && formik.errors.email && <p className="text-red-400 text-xs mt-1">{formik.errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-1.5">Nombre</label>
              <input id="first_name" name="first_name" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.first_name}
                className="w-full px-4 py-2.5 bg-gray-700/50 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 transition-all" placeholder="Juan" />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-1.5">Apellido</label>
              <input id="last_name" name="last_name" type="text" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.last_name}
                className="w-full px-4 py-2.5 bg-gray-700/50 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 transition-all" placeholder="Pérez" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">Contraseña *</label>
            <input id="password" name="password" type="password" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.password}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 transition-all" placeholder="••••••••" />
            {formik.touched.password && formik.errors.password && <p className="text-red-400 text-xs mt-1">{formik.errors.password}</p>}
          </div>

          <div>
            <label htmlFor="re_password" className="block text-sm font-medium text-gray-300 mb-1.5">Confirmar Contraseña *</label>
            <input id="re_password" name="re_password" type="password" onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.re_password}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 transition-all" placeholder="••••••••" />
            {formik.touched.re_password && formik.errors.re_password && <p className="text-red-400 text-xs mt-1">{formik.errors.re_password}</p>}
          </div>

          <button type="submit" disabled={formik.isSubmitting}
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-600/25">
            {formik.isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
          </button>

          <div className="text-center text-sm pt-2 border-t border-gray-700/50">
            <span className="text-gray-500">¿Ya tienes cuenta? </span>
            <Link to="/login" className="text-red-400 hover:text-red-300 font-medium transition-colors">Inicia sesión</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
