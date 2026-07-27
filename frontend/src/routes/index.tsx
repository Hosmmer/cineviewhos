import { Routes, Route } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import PublicRoutes from "@/routes/public";
import ProtectedRoutes from "@/routes/protected";
import AdminRoutes from "@/routes/admin";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <PublicRoutes />
        <ProtectedRoutes />
        <AdminRoutes />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
