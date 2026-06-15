import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useAuth } from '@/contexts/AuthContext'
import { updateProfile } from '@/services/authService'
import { User, Camera, ArrowLeft } from 'lucide-react'

const MAX_FILE_SIZE = 5 * 1024 * 1024

const validationSchema = yup.object({
  first_name: yup.string().max(150, 'Maximo 150 caracteres'),
  last_name: yup.string().max(150, 'Maximo 150 caracteres'),
})

function ProfilePage() {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar || null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user?.avatar) {
      setPreviewUrl(user.avatar)
    }
  }, [user?.avatar])

  const formik = useFormik({
    initialValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setFieldError }) => {
      try {
        const formData = new FormData()
        formData.append('first_name', values.first_name)
        formData.append('last_name', values.last_name)
        if (avatarFile) {
          formData.append('avatar', avatarFile)
        }

        const updatedUser = await updateProfile(formData)
        updateUser(updatedUser)
        setPreviewUrl(updatedUser.avatar || null)
        setAvatarFile(null)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al actualizar perfil'
        setFieldError('first_name', msg)
      }
    },
  })

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      formik.setFieldError('first_name', 'La imagen no debe superar 5 MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      formik.setFieldError('first_name', 'Solo se permiten imagenes')
      return
    }

    setAvatarFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const avatarUrl = previewUrl || null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/95 to-gray-900 z-0" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 z-10" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>

        <form onSubmit={formik.handleSubmit} className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 sm:p-8 space-y-5 shadow-2xl">
          <h1 className="text-xl font-bold text-white text-center">Mi Perfil</h1>

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleAvatarClick}
              className="relative w-24 h-24 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center overflow-hidden hover:border-red-500 transition-colors group cursor-pointer"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-gray-400" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleAvatarClick}
              className="text-sm text-gray-400 hover:text-red-400 transition-colors"
            >
              Cambiar foto
            </button>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1.5">Usuario</label>
            <input
              id="username"
              name="username"
              type="text"
              value={user?.username || ''}
              disabled
              className="w-full px-4 py-2.5 bg-gray-700/30 text-gray-500 text-sm rounded-lg border border-gray-600/50 cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2.5 bg-gray-700/30 text-gray-500 text-sm rounded-lg border border-gray-600/50 cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-1.5">Nombre</label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              autoComplete="given-name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.first_name}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 transition-all"
              placeholder="Tu nombre"
            />
            {formik.touched.first_name && formik.errors.first_name && (
              <p className="text-red-400 text-xs mt-1">{formik.errors.first_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-1.5">Apellido</label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              autoComplete="family-name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.last_name}
              className="w-full px-4 py-2.5 bg-gray-700/50 text-white text-sm rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder-gray-400 transition-all"
              placeholder="Tu apellido"
            />
            {formik.touched.last_name && formik.errors.last_name && (
              <p className="text-red-400 text-xs mt-1">{formik.errors.last_name}</p>
            )}
          </div>

          {success && (
            <p className="text-green-400 text-xs text-center bg-green-400/10 py-2 rounded-lg">Perfil actualizado correctamente</p>
          )}

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-600/25"
          >
            {formik.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
