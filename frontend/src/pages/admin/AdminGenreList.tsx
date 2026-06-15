import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAdminGenres, deleteGenre } from '@/services/movieService'
import type { Genre } from '@/types/movies'

function AdminGenreList() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: genres, isLoading, error } = useQuery<Genre[]>({
    queryKey: ['admin-genres'],
    queryFn: fetchAdminGenres,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteGenre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-genres'] })
      setDeleteId(null)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-800 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Failed to load genres.</p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-genres'] })}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Genres</h1>
        <button
          onClick={() => navigate('/admin/genres/create')}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
        >
          + New Genre
        </button>
      </div>

      <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Name</th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Created</th>
              <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {genres && genres.length > 0 ? (
              genres.map((genre) => (
                <tr key={genre.id} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm text-white">{genre.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{new Date(genre.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/genres/${genre.id}/edit`)}
                        className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(genre.id)}
                        className="px-3 py-1 text-xs bg-red-900/50 text-red-400 rounded hover:bg-red-900 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-gray-500">No genres found. Create your first genre to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Genre</h3>
            <p className="text-sm text-gray-400 mb-6">
              Are you sure you want to delete this genre? This action cannot be undone. Genres referenced by movies cannot be deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
            {deleteMutation.error && (
              <p className="mt-3 text-sm text-red-400">
                {(deleteMutation.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to delete genre.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminGenreList
