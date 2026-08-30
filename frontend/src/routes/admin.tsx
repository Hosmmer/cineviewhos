import { lazy } from "react";
import { Route } from "react-router-dom";

const AdminDashboard = lazy(() => import("@/features/system/pages/AdminDashboard"));
const AdminGenreList = lazy(() => import("@/features/movies/admin/AdminGenreList"));
const AdminGenreForm = lazy(() => import("@/features/movies/admin/AdminGenreForm"));
const AdminMovieList = lazy(() => import("@/features/movies/admin/AdminMovieList"));
const AdminMovieForm = lazy(() => import("@/features/movies/admin/AdminMovieForm"));
const AdminDirectorList = lazy(() => import("@/features/movies/admin/AdminDirectorList"));
const AdminDirectorForm = lazy(() => import("@/features/movies/admin/AdminDirectorForm"));
const AdminAuthorList = lazy(() => import("@/features/movies/admin/AdminAuthorList"));
const AdminAuthorForm = lazy(() => import("@/features/movies/admin/AdminAuthorForm"));
const AdminActorList = lazy(() => import("@/features/movies/admin/AdminActorList"));
const AdminActorForm = lazy(() => import("@/features/movies/admin/AdminActorForm"));
const AdminSalaList = lazy(() => import("@/features/bookings/admin/AdminSalaList"));
const AdminSalaForm = lazy(() => import("@/features/bookings/admin/AdminSalaForm"));
const AdminCineList = lazy(() => import("@/features/bookings/admin/AdminCineList"));
const AdminCineForm = lazy(() => import("@/features/bookings/admin/AdminCineForm"));
const AdminCineDetail = lazy(() => import("@/features/bookings/admin/AdminCineDetail"));
const AdminFuncionList = lazy(() => import("@/features/bookings/admin/AdminFuncionList"));
const AdminFuncionForm = lazy(() => import("@/features/bookings/admin/AdminFuncionForm"));
const AdminReservationList = lazy(
  () => import("@/features/bookings/admin/AdminReservationList"),
);
const AdminFormatList = lazy(() => import("@/features/bookings/admin/AdminFormatList"));
const AdminFormatForm = lazy(() => import("@/features/bookings/admin/AdminFormatForm"));
const AdminFranjaList = lazy(() => import("@/features/bookings/admin/AdminFranjaList"));
const AdminFranjaForm = lazy(() => import("@/features/bookings/admin/AdminFranjaForm"));
const AdminCashierPage = lazy(() => import("@/features/bookings/admin/AdminCashierPage"));
const AdminRoleList = lazy(() => import("@/features/system/pages/AdminRoleList"));
const AdminUserList = lazy(() => import("@/features/system/pages/AdminUserList"));
const AdminModuleList = lazy(() => import("@/features/system/pages/AdminModuleList"));
const AdminMovieDisplayConfig = lazy(
  () => import("@/features/movies/admin/AdminMovieDisplayConfig"),
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
