import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import publicRoutes from "@/routes/public";
import protectedRoutes from "@/routes/protected";
import adminChildren from "@/routes/admin";

const Fallback = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-900">
    <div className="animate-spin h-10 w-10 border-4 border-red-500 border-t-transparent rounded-full" />
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route element={<MainLayout />}>
          {publicRoutes}
          {protectedRoutes}
        </Route>
        <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
          {adminChildren}
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
