import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { fetchAdminGenres, createGenre, updateGenre } from '@/services/movieService'
import type { Genre } from '@/types/movies'

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Genre name is required')
    .min(1, 'Must be at least 1 character')
    .max(100, 'Must be 100 characters or fewer'),
})

function AdminGenreForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: genres } = useQuery<Genre[]>({
    queryKey: ['admin-genres'],
    queryFn: fetchAdminGenres,
  })

  const existingGenre = isEdit ? genres?.find((g) => g.id === Number(id)) : undefined

  const createMutation = useMutation({
    mutationFn: createGenre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-genres'] })
      navigate('/admin/genres')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: { name: string }) => updateGenre(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-genres'] })
      navigate('/admin/genres')
    },
  })

  const formik = useFormik({
    initialValues: { name: '' },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (isEdit) {
        updateMutation.mutate(values)
      } else {
        createMutation.mutate(values)
      }
    },
  })

  useEffect(() => {
    if (isEdit && existingGenre) {
      formik.setValues({ name: existingGenre.name })
    }
  }, [isEdit, existingGenre])

  const isPending = createMutation.isPending || updateMutation.isPending
  const serverError = (createMutation.error || updateMutation.error) as { response?: { data?: { detail?: string; name?: string[] } } } | null

  useEffect(() => {
    if (serverError?.response?.data?.name) {
      formik.setFieldError('name', serverError.response.data.name[0])
    }
  }, [serverError])

  if (isEdit && !existingGenre) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">{isEdit ? 'Edit Genre' : 'New Genre'}</h1>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
          <input
            id="name"
            type="text"
            {...formik.getFieldProps('name')}
            className={`w-full bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5 border ${
              formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-gray-700 focus:border-red-500'
            } focus:outline-none focus:ring-1 focus:ring-red-500`}
            placeholder="Action, Comedy, Drama..."
          />
          {formik.touched.name && formik.errors.name && (
            <p className="text-xs text-red-400 mt-1">{formik.errors.name}</p>
          )}
        </div>

        {serverError && !serverError.response?.data?.name && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg px-4 py-3">
            {serverError.response?.data?.detail || 'An error occurred.'}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/admin/genres')}
            className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
          >
            {isPending ? 'Saving...' : isEdit ? 'Update Genre' : 'Create Genre'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminGenreForm
