import { lazy } from "react";
import { Route } from "react-router-dom";

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
const AdminCineList = lazy(() => import("@/pages/admin/AdminCineList"));
const AdminCineForm = lazy(() => import("@/pages/admin/AdminCineForm"));
const AdminCineDetail = lazy(() => import("@/pages/admin/AdminCineDetail"));
const AdminFuncionList = lazy(() => import("@/pages/admin/AdminFuncionList"));
const AdminFuncionForm = lazy(() => import("@/pages/admin/AdminFuncionForm"));
const AdminReservationList = lazy(
  () => import("@/pages/admin/AdminReservationList"),
);
const AdminFormatList = lazy(() => import("@/pages/admin/AdminFormatList"));
const AdminFormatForm = lazy(() => import("@/pages/admin/AdminFormatForm"));
const AdminFranjaList = lazy(() => import("@/pages/admin/AdminFranjaList"));
const AdminFranjaForm = lazy(() => import("@/pages/admin/AdminFranjaForm"));
const AdminCashierPage = lazy(() => import("@/pages/admin/AdminCashierPage"));
const AdminRoleList = lazy(() => import("@/pages/admin/AdminRoleList"));
const AdminUserList = lazy(() => import("@/pages/admin/AdminUserList"));
const AdminModuleList = lazy(() => import("@/pages/admin/AdminModuleList"));
const AdminMovieDisplayConfig = lazy(
  () => import("@/pages/admin/AdminMovieDisplayConfig"),
);

const adminChildren = (
  <>
    <Route path="settings" element={<AdminDashboard />} />
    <Route path="settings/roles" element={<AdminRoleList />} />
    <Route path="settings/users" element={<AdminUserList />} />
    <Route path="settings/modules" element={<AdminModuleList />} />
    <Route path="movies" element={<AdminMovieList />} />
    <Route path="movies/create" element={<AdminMovieForm />} />
    <Route path="movies/:id/edit" element={<AdminMovieForm />} />
    <Route path="movies/directors" element={<AdminDirectorList />} />
    <Route path="movies/directors/create" element={<AdminDirectorForm />} />
    <Route path="movies/directors/:id/edit" element={<AdminDirectorForm />} />
    <Route path="movies/authors" element={<AdminAuthorList />} />
    <Route path="movies/authors/create" element={<AdminAuthorForm />} />
    <Route path="movies/authors/:id/edit" element={<AdminAuthorForm />} />
    <Route path="movies/actors" element={<AdminActorList />} />
    <Route path="movies/actors/create" element={<AdminActorForm />} />
    <Route path="movies/actors/:id/edit" element={<AdminActorForm />} />
    <Route path="movies/display-config" element={<AdminMovieDisplayConfig />} />
    <Route path="genres" element={<AdminGenreList />} />
    <Route path="genres/create" element={<AdminGenreForm />} />
    <Route path="genres/:id/edit" element={<AdminGenreForm />} />
    <Route path="reservations/rooms" element={<AdminSalaList />} />
    <Route path="reservations/rooms/create" element={<AdminSalaForm />} />
    <Route path="reservations/rooms/:id/edit" element={<AdminSalaForm />} />
    <Route path="reservations/cines" element={<AdminCineList />} />
    <Route path="reservations/cines/create" element={<AdminCineForm />} />
    <Route path="reservations/cines/:id/edit" element={<AdminCineForm />} />
    <Route path="reservations/cines/:id" element={<AdminCineDetail />} />
    <Route path="reservations/showtimes" element={<AdminFuncionList />} />
    <Route path="reservations/showtimes/create" element={<AdminFuncionForm />} />
    <Route path="reservations/showtimes/:id/edit" element={<AdminFuncionForm />} />
    <Route path="reservations/bookings" element={<AdminReservationList />} />
    <Route path="reservations/bookings/create" element={<AdminCashierPage />} />
    <Route path="reservations/formats" element={<AdminFormatList />} />
    <Route path="reservations/formats/create" element={<AdminFormatForm />} />
    <Route path="reservations/formats/:id/edit" element={<AdminFormatForm />} />
    <Route path="reservations/franjas" element={<AdminFranjaList />} />
    <Route path="reservations/franjas/create" element={<AdminFranjaForm />} />
    <Route path="reservations/franjas/:id/edit" element={<AdminFranjaForm />} />
  </>
);

export default adminChildren;
