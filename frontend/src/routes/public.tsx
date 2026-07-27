import { lazy } from "react";
import { Route } from "react-router-dom";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const PasswordResetPage = lazy(() => import("@/pages/PasswordResetPage"));
const PasswordResetConfirmPage = lazy(
  () => import("@/pages/PasswordResetConfirmPage"),
);

function PublicRoutes() {
  return (
    <Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/password/reset" element={<PasswordResetPage />} />
      <Route
        path="/password/reset/confirm/:uid/:token"
        element={<PasswordResetConfirmPage />}
      />
    </Route>
  );
}

export default PublicRoutes;
