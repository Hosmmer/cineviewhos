import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

function PasswordResetPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await resetPassword(email)
      setSent(true)
    } catch {
      setError('No se pudo enviar el email. Verifica la dirección.')
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 text-center max-w-sm w-full shadow-2xl">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Correo Enviado</h2>
          <p className="text-gray-400 text-sm mb-4">
            Si el email está registrado, recibirás un enlace para restablecer tu contraseña.
          </p>
          <Link to="/login" className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">Volver al inicio de sesión</Link>
        </div>
      </div>
    )
  }

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
          <p className="text-gray-400 text-sm">Recupera tu acceso</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 sm:p-8 space-y-5 shadow-2xl">
          <h1 className="text-xl font-bold text-white text-center">Restablecer Contraseña</h1>

          <p className="text-sm text-gray-400 text-center">Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.</p>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 transition-all"
              placeholder="correo@ejemplo.com"
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button type="submit"
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold tracking-wide transition-all shadow-lg shadow-red-600/25">
            Enviar Instrucciones
          </button>

          <div className="text-center text-sm pt-2 border-t border-gray-700/50">
            <Link to="/login" className="text-gray-400 hover:text-red-400 transition-colors">Volver al inicio de sesión</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PasswordResetPage
