import { Link, useLocation } from "react-router-dom";

const links = [
  {
    to: "/admin/movies",
    label: "Movies",
    icon: "M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z",
  },
  {
    to: "/admin/genres",
    label: "Genres",
    icon: "M7 7h-1a2 2 0 00-2 2v9a2 2 0 002 2h1M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10M17 7h1a2 2 0 012 2v9a2 2 0 01-2 2h-1M17 7v12",
  },
];

function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col shrink-0">
      <div className="p-4 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-red-500 text-2xl">&#9654;</span>
          <span className="text-xl font-bold tracking-tight text-white">
            Cine<span className="text-red-500">ViewHos</span>
          </span>
        </Link>
        <p className="text-xs text-gray-500 mt-1 ml-1">Admin Panel</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const active = location.pathname.startsWith(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors no-underline ${
                active
                  ? "bg-red-600/10 text-red-500 border-l-2 border-red-500"
                  : "text-gray-400 hover:text-white hover:bg-gray-800 border-l-2 border-transparent"
              }`}
            >
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d={link.icon}
                />
              </svg>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors no-underline"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>
      </div>
    </aside>
  );
}

export default AdminSidebar;
