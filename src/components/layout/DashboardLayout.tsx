import { Outlet, useLocation } from "react-router-dom";
import { Bell, Search } from "lucide-react";
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

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 shrink-0">
          {/* Page title */}
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-gray-800">{pageTitle}</h2>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 w-56">
            <Search size={14} className="text-gray-400 shrink-0" />
            <span className="text-gray-400 text-xs">Search...</span>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            System Active
          </div>

          {/* Bell */}
          <button className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell size={18} className="text-gray-500" />
          </button>

          {/* User */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
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
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
