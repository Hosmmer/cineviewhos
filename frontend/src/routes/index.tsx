import { Routes, Route } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import publicRoutes from "@/routes/public";
import protectedRoutes from "@/routes/protected";
import adminRoutes from "@/routes/admin";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {publicRoutes}
        {protectedRoutes}
        {adminRoutes}
      </Route>
    </Routes>
  );
}

export default AppRoutes;
