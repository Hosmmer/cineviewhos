import { lazy } from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";

const HomePage = lazy(() => import("@/pages/HomePage"));
const MovieDetailPage = lazy(() => import("@/pages/MovieDetailPage"));
const SeatSelectionPage = lazy(() => import("@/pages/SeatSelectionPage"));
const MyReservationsPage = lazy(() => import("@/pages/MyReservationsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const ChangePasswordPage = lazy(() => import("@/pages/ChangePasswordPage"));

function ProtectedRoutes() {
  return (
    <Route>
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
    </Route>
  );
}

export default ProtectedRoutes;
