import { lazy } from "react";
import { Route } from "react-router-dom";

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const PasswordResetPage = lazy(() => import("@/features/auth/pages/PasswordResetPage"));
const PasswordResetConfirmPage = lazy(
  () => import("@/features/auth/pages/PasswordResetConfirmPage"),
);

const publicRoutes = (
  <>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/password/reset" element={<PasswordResetPage />} />
    <Route
      path="/password/reset/confirm/:uid/:token"
      element={<PasswordResetConfirmPage />}
    />
  </>
);

export default publicRoutes;
