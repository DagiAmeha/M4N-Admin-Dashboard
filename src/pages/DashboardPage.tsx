import { useEffect, useState } from "react";
import {
  Mic2,
  BookOpen,
  Calendar,
  MessageSquareHeart,
  Users,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import StatsCard from "../components/ui/StatsCard";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import YearlyPerformanceDashboard from "../components/dashboard/YearlyPerformanceDashboard";

interface Stats {
  sermons: number;
  books: number;
  events: number;
  testimonies: number;
  users: number;
  plans: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    sermons: 0,
    books: 0,
    events: 0,
    testimonies: 0,
    users: 0,
    plans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sermons, books, events, testimonies, plans, users] =
          await Promise.allSettled([
            api.get("/api/sermons/all"),
            api.get("/api/books"),
            api.get("/api/events?limit=1"),
            api.get("/api/testimonies?limit=1"),
            api.get("/api/subscription/plans"),
            api.get("/api/users?limit=1"),
          ]);

        console.log("Stats API results:", {
          sermons,
          books,
          events,
          testimonies,
          plans,
          users,
        });
        setStats({
          sermons:
            sermons.status === "fulfilled"
              ? (sermons.value.data?.data?.length ?? 0)
              : 0,
          books:
            books.status === "fulfilled"
              ? (books.value.data?.data?.length ?? 0)
              : 0,
          events:
            events.status === "fulfilled"
              ? (events.value.data?.pagination?.total ??
                events.value.data?.length ??
                0)
              : 0,
          testimonies:
            testimonies.status === "fulfilled"
              ? (testimonies.value.data?.pagination?.total ?? 0)
              : 0,
          users:
            users.status === "fulfilled"
              ? (users.value.data?.pagination?.total ?? 0)
              : 0,
          plans:
            plans.status === "fulfilled"
              ? (plans.value.data?.data?.length ?? 0)
              : 0,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = [
    {
      label: "Sermons",
      value: stats.sermons,
      icon: Mic2,
      color: "indigo" as const,
    },
    {
      label: "Books",
      value: stats.books,
      icon: BookOpen,
      color: "blue" as const,
    },
    {
      label: "Events",
      value: stats.events,
      icon: Calendar,
      color: "green" as const,
    },
    {
      label: "Testimonies",
      value: stats.testimonies,
      icon: MessageSquareHeart,
      color: "pink" as const,
    },
    {
      label: "Registered Users",
      value: stats.users,
      icon: Users,
      color: "orange" as const,
    },
    {
      label: "Subscription Plans",
      value: stats.plans,
      icon: CreditCard,
      color: "purple" as const,
    },
  ];

  const quickLinks = [
    { to: "/sermons", label: "Manage Sermons", color: "bg-indigo-500" },
    { to: "/books", label: "Manage Books", color: "bg-blue-500" },
    { to: "/events", label: "Manage Events", color: "bg-green-500" },
    { to: "/testimonies", label: "Manage Testimonies", color: "bg-pink-500" },
    {
      to: "/subscriptions",
      label: "Subscription Plans",
      color: "bg-purple-500",
    },
    { to: "/categories", label: "Sermon Categories", color: "bg-yellow-500" },
    { to: "/users", label: "View Users", color: "bg-orange-500" },
    { to: "/payments", label: "View Payments", color: "bg-teal-500" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner */}
      <div className="flex flex-col gap-4 rounded-2xl bg-indigo-600 p-4 text-white sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3 sm:items-center sm:gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 sm:h-14 sm:w-14">
            <TrendingUp size={28} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold sm:text-xl">
              Welcome back, {user?.username ?? "Admin"}!
            </h1>
            <p className="mt-0.5 text-xs text-indigo-200 sm:text-sm">
              Here's what's happening with your church platform.
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-sm font-semibold lg:flex">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Live Dashboard
        </div>
      </div>

      <YearlyPerformanceDashboard />

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse h-24"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <StatsCard key={card.label} {...card} />
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all"
            >
              <div className={`w-2 h-8 ${link.color} rounded-full shrink-0`} />
              <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-700">
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
