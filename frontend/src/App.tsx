import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import AdminLayout from "@/components/AdminLayout";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const PasswordResetPage = lazy(() => import("./pages/PasswordResetPage"));
const PasswordResetConfirmPage = lazy(
  () => import("./pages/PasswordResetConfirmPage"),
);
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ChangePasswordPage = lazy(() => import("./pages/ChangePasswordPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminGenreList = lazy(() => import("./pages/admin/AdminGenreList"));
const AdminGenreForm = lazy(() => import("./pages/admin/AdminGenreForm"));
const AdminMovieList = lazy(() => import("./pages/admin/AdminMovieList"));
const AdminMovieForm = lazy(() => import("./pages/admin/AdminMovieForm"));
const AdminDirectorList = lazy(() => import("./pages/admin/AdminDirectorList"));
const AdminDirectorForm = lazy(() => import("./pages/admin/AdminDirectorForm"));
const AdminAuthorList = lazy(() => import("./pages/admin/AdminAuthorList"));
const AdminAuthorForm = lazy(() => import("./pages/admin/AdminAuthorForm"));
const AdminActorList = lazy(() => import("./pages/admin/AdminActorList"));
const AdminActorForm = lazy(() => import("./pages/admin/AdminActorForm"));

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
          <div className="animate-spin h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/password/reset" element={<PasswordResetPage />} />
          <Route
            path="/password/reset/confirm/:uid/:token"
            element={<PasswordResetConfirmPage />}
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  <HomePage />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="genres" element={<AdminGenreList />} />
            <Route path="genres/create" element={<AdminGenreForm />} />
            <Route path="genres/:id/edit" element={<AdminGenreForm />} />
            <Route path="movies" element={<AdminMovieList />} />
            <Route path="movies/create" element={<AdminMovieForm />} />
            <Route path="movies/:id/edit" element={<AdminMovieForm />} />
            <Route path="directors" element={<AdminDirectorList />} />
            <Route path="directors/create" element={<AdminDirectorForm />} />
            <Route path="directors/:id/edit" element={<AdminDirectorForm />} />
            <Route path="authors" element={<AdminAuthorList />} />
            <Route path="authors/create" element={<AdminAuthorForm />} />
            <Route path="authors/:id/edit" element={<AdminAuthorForm />} />
            <Route path="actors" element={<AdminActorList />} />
            <Route path="actors/create" element={<AdminActorForm />} />
            <Route path="actors/:id/edit" element={<AdminActorForm />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
