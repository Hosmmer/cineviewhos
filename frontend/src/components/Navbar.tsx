import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";
import UserDrawer from "@/components/UserDrawer";

function getAvatarFromStorage(): string | null {
  try {
    const raw = localStorage.getItem("auth_user");
    if (raw) return JSON.parse(raw).avatar || null;
  } catch {
    /* ignore */
  }
  return null;
}

function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const avatarUrl = user?.avatar || getAvatarFromStorage() || null;

  return (
    <nav className="bg-gray-950 border-b border-gray-800 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          className="flex items-center gap-2 text-white no-underline"
          to="/"
        >
          <span className="text-red-500 text-2xl">&#9654;</span>
          <span className="text-xl font-bold tracking-tight">
            Cine<span className="text-red-500">ViewHos</span>
          </span>
        </Link>

        <div className="hidden sm:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar peliculas..."
              className="w-full bg-gray-800 text-gray-200 text-sm rounded-full pl-10 pr-4 py-2 border border-gray-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-gray-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {isAuthenticated ? (
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center overflow-hidden hover:border-red-500 transition-colors shrink-0"
            aria-label="Open user menu"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-gray-400" />
            )}
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Iniciar Sesion
            </Link>
            <Link
              to="/register"
              className="text-sm px-4 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Registrarse
            </Link>
          </div>
        )}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden text-gray-300 ml-3"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="sm:hidden mt-3 pt-3 border-t border-gray-800 space-y-2">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Buscar peliculas..."
              className="w-full bg-gray-800 text-gray-200 text-sm rounded-full pl-10 pr-4 py-2 border border-gray-700 focus:outline-none focus:border-red-500 placeholder-gray-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {isAuthenticated ? (
            <button
              onClick={() => {
                setDrawerOpen(true);
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full text-left px-2 py-1 text-gray-300 hover:text-white transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user?.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <span className="text-sm">{user?.username}</span>
            </button>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block text-sm text-gray-300 px-2 py-1"
              >
                Iniciar Sesion
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="block text-sm text-red-400 px-2 py-1"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}

      <UserDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </nav>
  );
}

export default Navbar;
