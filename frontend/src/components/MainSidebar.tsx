import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useModules } from "@/hooks/useModules";
import { ChevronDown, X, Menu } from "lucide-react";
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

function getIcon(name: string, className: string) {
  const Icon = (AllIcons as Record<string, React.ComponentType<{ className?: string }>>)[name];
  if (Icon) {
    return <Icon className={className} />;
  }
  return <FallbackIcon className={className} />;
}

function SidebarGroup({
  module,
  activePath,
}: {
  module: Module;
  activePath: string;
}) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (module.children.some((c) => activePath.startsWith(c.route || ""))) {
      setExpanded(true);
    }
  }, [activePath, module.children]);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
      >
        {getIcon(module.icon, "w-5 h-5 shrink-0")}
        <span className="flex-1 text-left">{module.name}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="ml-9 mt-0.5 mb-1 space-y-0.5">
          {module.children.map((child) => {
            const active = activePath.startsWith(child.route || "");
            return (
              <Link
                key={child.id}
                to={child.route || "#"}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors no-underline ${
                  active
                    ? "bg-red-600/10 text-red-500 border-l-2 border-red-500"
                    : "text-gray-400 hover:text-white hover:bg-gray-800 border-l-2 border-transparent"
                }`}
              >
                {getIcon(child.icon, "w-4 h-4 shrink-0")}
                {child.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MainSidebar() {
  const location = useLocation();
  const { data: modules, isLoading } = useModules();
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-red-500 text-2xl">&#9654;</span>
          <span className="text-xl font-bold tracking-tight text-white">
            Cine<span className="text-red-500">ViewHos</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full" />
          </div>
        )}
        {modules?.map((mod) => (
          <SidebarGroup
            key={mod.id}
            module={mod}
            activePath={location.pathname}
          />
        ))}
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

      <aside className="hidden lg:flex w-64 bg-gray-950 border-r border-gray-800 flex-col shrink-0 min-h-screen">
        {sidebarContent}
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
