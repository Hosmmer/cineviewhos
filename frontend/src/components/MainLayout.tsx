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
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
