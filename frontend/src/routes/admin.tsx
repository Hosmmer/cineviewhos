import { lazy } from "react";
import { Route } from "react-router-dom";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import AdminLayout from "@/components/AdminLayout";

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminGenreList = lazy(() => import("@/pages/admin/AdminGenreList"));
const AdminGenreForm = lazy(() => import("@/pages/admin/AdminGenreForm"));
const AdminMovieList = lazy(() => import("@/pages/admin/AdminMovieList"));
const AdminMovieForm = lazy(() => import("@/pages/admin/AdminMovieForm"));
const AdminDirectorList = lazy(() => import("@/pages/admin/AdminDirectorList"));
const AdminDirectorForm = lazy(() => import("@/pages/admin/AdminDirectorForm"));
const AdminAuthorList = lazy(() => import("@/pages/admin/AdminAuthorList"));
const AdminAuthorForm = lazy(() => import("@/pages/admin/AdminAuthorForm"));
const AdminActorList = lazy(() => import("@/pages/admin/AdminActorList"));
const AdminActorForm = lazy(() => import("@/pages/admin/AdminActorForm"));
const AdminSalaList = lazy(() => import("@/pages/admin/AdminSalaList"));
const AdminSalaForm = lazy(() => import("@/pages/admin/AdminSalaForm"));
const AdminFuncionList = lazy(() => import("@/pages/admin/AdminFuncionList"));
const AdminFuncionForm = lazy(() => import("@/pages/admin/AdminFuncionForm"));
const AdminReservationList = lazy(
  () => import("@/pages/admin/AdminReservationList"),
);

function AdminRoutes() {
  return (
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
      <Route path="salas" element={<AdminSalaList />} />
      <Route path="salas/create" element={<AdminSalaForm />} />
      <Route path="salas/:id/edit" element={<AdminSalaForm />} />
      <Route path="funciones" element={<AdminFuncionList />} />
      <Route path="funciones/create" element={<AdminFuncionForm />} />
      <Route path="funciones/:id/edit" element={<AdminFuncionForm />} />
      <Route path="reservations" element={<AdminReservationList />} />
    </Route>
  );
}

export default AdminRoutes;
