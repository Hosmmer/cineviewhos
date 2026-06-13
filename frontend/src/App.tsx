import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import ProtectedRoute from '@/components/ProtectedRoute'

const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const PasswordResetPage = lazy(() => import('./pages/PasswordResetPage'))
const PasswordResetConfirmPage = lazy(() => import('./pages/PasswordResetConfirmPage'))

const authRoutes = ['/login', '/register', '/password/reset']

function App() {
  const location = useLocation()
  const isAuthPage = authRoutes.includes(location.pathname) || location.pathname.startsWith('/password/reset/confirm')

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {!isAuthPage && <Navbar />}
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
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default App
