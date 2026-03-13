import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Mic2,
  BookOpen,
  Calendar,
  MessageSquareHeart,
  CreditCard,
  Users,
  Star,
  ShoppingBag,
  LogOut,
  Radio,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const sections = [
  {
    label: "OVERVIEW",
    items: [{ to: "/", icon: LayoutDashboard, label: "Dashboard", end: true }],
  },
  {
    label: "CONTENT",
    items: [
      { to: "/sermons", icon: Mic2, label: "Sermons" },
      { to: "/categories", icon: Star, label: "Categories" },
      { to: "/books", icon: BookOpen, label: "Books" },
      { to: "/events", icon: Calendar, label: "Events" },
      { to: "/testimonies", icon: MessageSquareHeart, label: "Testimonies" },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { to: "/subscriptions", icon: CreditCard, label: "Subscriptions" },
      { to: "/users", icon: Users, label: "Users" },
      { to: "/payments", icon: ShoppingBag, label: "Payments" },
    ],
  },
  {
    label: "LIVE",
    items: [{ to: "/live", icon: Radio, label: "Live Session" }],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
    toast.success("Logged out");
  }

  return (
    <aside className="w-60 min-h-screen bg-gray-900 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div
            style={{ mixBlendMode: "screen", display: "inline-flex" }}
            className="shrink-0"
          >
            <img
              src="/assets/logo.png"
              alt="logo"
              className="w-9 h-9 object-contain"
            />
          </div>
          <div className="overflow-hidden">
            <p
              className="font-black text-xs leading-tight truncate"
              style={{
                background:
                  "linear-gradient(135deg, #c8960c 0%, #f5d060 50%, #c8960c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Mission For Nation
            </p>
            <p className="text-yellow-700 text-xs font-semibold truncate">
              Ministry
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-scroll flex-1 px-3 py-3 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="text-gray-500 text-xs font-semibold tracking-widest px-3 mb-1.5">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/40"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={16}
                        className={isActive ? "text-white" : "text-gray-500"}
                      />
                      <span className="flex-1 font-medium">{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="px-3 py-3 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.username?.charAt(0).toUpperCase() ?? "A"}
            </span>
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-white text-sm font-semibold truncate">
              {user?.username ?? "Admin"}
            </p>
            <p className="text-gray-500 text-xs truncate">
              {user?.role === "admin" ? "Administrator" : "Admin"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors w-full"
        >
          <LogOut size={16} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
