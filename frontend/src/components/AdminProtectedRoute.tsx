import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user?.is_staff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
        <p className="text-xl text-gray-400 mb-6">You do not have permission to access this page.</p>
        <a href="/" className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Back to Home</a>
      </div>
    )
  }

  return <>{children}</>
}

export default AdminProtectedRoute
