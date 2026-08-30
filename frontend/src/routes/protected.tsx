import { lazy } from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "@/routes/ProtectedRoute";

const MovieHomePage = lazy(() => import("@/features/movies/pages/MovieHomePage"));
const MovieDetailPage = lazy(() => import("@/features/movies/pages/MovieDetailPage"));
const SeatSelectionPage = lazy(() => import("@/features/bookings/pages/SeatSelectionPage"));
const MyReservationsPage = lazy(() => import("@/features/bookings/pages/MyReservationsPage"));
const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"));
const ChangePasswordPage = lazy(() => import("@/features/profile/pages/ChangePasswordPage"));

const protectedRoutes = (
  <>
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <MovieHomePage />
          </div>
        </ProtectedRoute>
      }
    />
    <Route
      path="/movies/:id"
      element={
        <ProtectedRoute>
          <MovieDetailPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/movies/:id/funcion/:funcionId/seats"
      element={
        <ProtectedRoute>
          <SeatSelectionPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/my-reservations"
      element={
        <ProtectedRoute>
          <MyReservationsPage />
        </ProtectedRoute>
      }
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
  </>
);

export default protectedRoutes;
