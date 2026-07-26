import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import MainSidebar from "./MainSidebar";

function MainLayout() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname.startsWith("/password/reset");
  const isAdminPage = location.pathname.startsWith("/admin");
  const hideNavbar = isAuthPage || isAdminPage;
  const hideSidebar = isAuthPage || isAdminPage;

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {!hideNavbar && <Navbar />}
      <div className="flex flex-1">
        {!hideSidebar && <MainSidebar />}
        <main className="flex-1">
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-full min-h-[50vh]">
                <div className="animate-spin h-8 w-8 border-3 border-red-500 border-t-transparent rounded-full" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
