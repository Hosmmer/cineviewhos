import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import AdminLayout from '@/components/AdminLayout'

const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const PasswordResetPage = lazy(() => import('./pages/PasswordResetPage'))
const PasswordResetConfirmPage = lazy(() => import('./pages/PasswordResetConfirmPage'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminGenreList = lazy(() => import('./pages/admin/AdminGenreList'))
const AdminGenreForm = lazy(() => import('./pages/admin/AdminGenreForm'))
const AdminMovieList = lazy(() => import('./pages/admin/AdminMovieList'))
const AdminMovieForm = lazy(() => import('./pages/admin/AdminMovieForm'))

const authRoutes = ['/login', '/register', '/password/reset']

function App() {
  const location = useLocation()
  const isAuthPage = authRoutes.includes(location.pathname) || location.pathname.startsWith('/password/reset/confirm')
  const isAdminPage = location.pathname.startsWith('/admin')
  const hideNavbar = isAuthPage || isAdminPage

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {!hideNavbar && <Navbar />}
      <main className="flex-1 w-full">
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-screen bg-gray-900">
            <div className="animate-spin h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full" />
          </div>
        }>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/password/reset" element={<PasswordResetPage />} />
            <Route path="/password/reset/confirm/:uid/:token" element={<PasswordResetConfirmPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  <HomePage />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="genres" element={<AdminGenreList />} />
              <Route path="genres/create" element={<AdminGenreForm />} />
              <Route path="genres/:id/edit" element={<AdminGenreForm />} />
              <Route path="movies" element={<AdminMovieList />} />
              <Route path="movies/create" element={<AdminMovieForm />} />
              <Route path="movies/:id/edit" element={<AdminMovieForm />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default App
