import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Bell, Menu, Search, X } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/sermons": "Sermons",
  "/categories": "Sermon Categories",
  "/books": "Books",
  "/events": "Events",
  "/testimonies": "Testimonies",
  "/subscriptions": "Subscription Plans",
  "/users": "Users",
  "/payments": "Payments & Purchases",
  "/live": "Live Session",
};

export default function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const pageTitle = titles[location.pathname] ?? "Admin";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <div
        className={`relative hidden h-screen overflow-hidden transition-all duration-300 ease-in-out lg:block ${desktopSidebarOpen ? "w-60" : "w-0"}`}
      >
        <Sidebar
          className={`h-full min-h-full transition-transform duration-300 ease-in-out ${desktopSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        />
      </div>

      <div
        className={`fixed inset-0 z-40 flex transition-opacity duration-300 lg:hidden ${
          sidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label="Close navigation"
          className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`relative h-full w-[17rem] max-w-[85vw] transform transition-transform duration-300 ease-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            className="h-full min-h-full w-full"
            onNavigate={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex min-h-14 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3 py-2 sm:gap-3 sm:px-4 md:px-6">
          <button
            type="button"
            className="inline-flex rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <button
            type="button"
            className="hidden rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 lg:inline-flex"
            onClick={() => setDesktopSidebarOpen((prev) => !prev)}
            aria-label={desktopSidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            <Menu size={18} />
          </button>

          {/* Page title */}
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-gray-800">
              {pageTitle}
            </h2>
          </div>

          {/* Search */}
          <div className="hidden w-56 items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 md:flex lg:w-64">
            <Search size={14} className="text-gray-400 shrink-0" />
            <span className="text-gray-400 text-xs">Search...</span>
          </div>

          {/* Status badge */}
          <div className="hidden items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-600 xl:flex">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            System Active
          </div>

          {/* Bell */}
          <button className="relative hidden rounded-lg p-1.5 transition-colors hover:bg-gray-100 sm:inline-flex">
            <Bell size={18} className="text-gray-500" />
          </button>

          {/* User */}
          <div className="flex items-center gap-2 border-l border-gray-200 pl-2 sm:pl-3">
            <div className="w-8 h-8 rounded-full bg-gray-900 border border-yellow-800 flex items-center justify-center overflow-hidden">
              <div style={{ mixBlendMode: "screen", display: "inline-flex" }}>
                <img
                  src="/assets/logo.png"
                  alt="logo"
                  className="w-6 h-6 object-contain"
                />
              </div>
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-gray-800 leading-tight">
                {user?.username ?? "Admin"}
              </p>
              <p className="text-xs text-gray-400 leading-tight">Admin</p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
