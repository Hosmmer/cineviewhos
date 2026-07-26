import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useModules } from "@/hooks/useModules";
import {
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Menu,
  Home,
} from "lucide-react";
import * as AllIcons from "./lucide-icons.generated";
import type { Module } from "@/types/modules";

const FallbackIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 4a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H5a1 1 0 110-2h6V5a1 1 0 011-1z"
    />
  </svg>
);

const iconLookup = AllIcons as Record<string, React.ComponentType<{ className?: string }>>;
function getIcon(name: string, className: string) {
  const Icon = iconLookup[name];
  return Icon ? <Icon className={className} /> : <FallbackIcon className={className} />;
}

const SidebarGroup = memo(function SidebarGroup({
  module,
  activePath,
  collapsed,
}: {
  module: Module;
  activePath: string;
  collapsed: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [closedByUser, setClosedByUser] = useState(false);

  const hasActiveChild = module.children.some((c) => activePath.startsWith(c.route || ""));
  const isExpanded = collapsed
    ? expanded
    : !closedByUser && hasActiveChild ? true : expanded;
  const hasChildren = module.children.length > 0;

  useEffect(() => {
    if (hasActiveChild) {
      setClosedByUser(false);
    }
  }, [hasActiveChild]);

  const handleClick = () => {
    if (!hasChildren) return;
    if (isExpanded) {
      setExpanded(false);
      setClosedByUser(true);
    } else {
      setExpanded(true);
      setClosedByUser(false);
    }
  };

  return (
    <div className={collapsed && isExpanded && hasChildren ? "bg-gray-800/30 rounded-lg mx-0.5 mb-1" : ""}>
      <button
        onClick={handleClick}
        title={collapsed ? module.name : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
          isExpanded
            ? "bg-red-600/10 text-red-500 border-l-2 border-red-500"
            : "text-gray-300 hover:text-white hover:bg-gray-800 border-l-2 border-transparent"
        } ${collapsed ? "justify-center" : ""}`}
      >
        {getIcon(module.icon, "w-5 h-5 shrink-0")}
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{module.name}</span>
            {hasChildren && (
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            )}
          </>
        )}
      </button>

      {hasChildren && isExpanded && (
        <div className={`${collapsed ? "mx-2 pb-1" : "ml-9"} mt-0.5 mb-1 space-y-0.5`}>
          {module.children.map((child) => {
            const active = activePath.startsWith(child.route || "");
            return (
              <Link
                key={child.id}
                to={child.route || "#"}
                title={collapsed ? child.name : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors no-underline ${
                  active
                    ? "bg-red-600/10 text-red-500 border-l-2 border-red-500"
                    : "text-gray-400 hover:text-white hover:bg-gray-800 border-l-2 border-transparent"
                } ${collapsed ? "justify-center" : ""}`}
              >
                {getIcon(child.icon, "w-4 h-4 shrink-0")}
                {!collapsed && child.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
});

function MainSidebar() {
  const location = useLocation();
  const { data: modules } = useModules();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  }, []);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  const headerContent = collapsed ? (
    <Link to="/" className="no-underline shrink-0" title="CineViewHos">
      <span className="text-red-500 text-2xl">&#9654;</span>
    </Link>
  ) : (
    <Link to="/" className="flex items-center gap-2 no-underline shrink-0 truncate">
      <span className="text-red-500 text-2xl">&#9654;</span>
      <span className="text-xl font-bold tracking-tight text-white">
        Cine<span className="text-red-500">ViewHos</span>
      </span>
    </Link>
  );

  const sidebarContent = (
    <>
      <div
        className={`flex items-center border-b border-gray-800 ${
          collapsed ? "flex-col justify-center gap-2 p-3" : "p-4 justify-between"
        }`}
      >
        {headerContent}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors no-underline ${
            location.pathname === "/"
              ? "bg-red-600/10 text-red-500 border-l-2 border-red-500"
              : "text-gray-300 hover:text-white hover:bg-gray-800 border-l-2 border-transparent"
          } ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Home" : undefined}
        >
          <Home className="w-5 h-5 shrink-0" />
          {!collapsed && "Home"}
        </Link>

        {modules?.map((mod) => (
          <SidebarGroup
            key={mod.id}
            module={mod}
            activePath={location.pathname}
            collapsed={collapsed}
          />
        ))}
      </nav>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-30 p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      <aside
        className={`hidden lg:flex bg-gray-950 border-r border-gray-800 flex-col shrink-0 min-h-screen transition-[width] duration-300 ease-in-out relative ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent}
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors flex items-center justify-center shadow-md"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-3.5 h-3.5" />
          ) : (
            <PanelLeftClose className="w-3.5 h-3.5" />
          )}
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Sidebar menu"
            onKeyDown={handleKeyDown}
            className="fixed top-0 left-0 h-full w-[85vw] sm:w-[360px] bg-gray-950 border-r border-gray-800 shadow-2xl flex flex-col"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="pt-12 flex-1 flex flex-col">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MainSidebar;
