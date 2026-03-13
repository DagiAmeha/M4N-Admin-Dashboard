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
import { type PaymentSummaryData } from "../components/ui/PaymentSummaryChart";
import YearlyPerformanceDashboard from "../components/dashboard/YearlyPerformanceDashboard";

interface Stats {
  sermons: number;
  books: number;
  events: number;
  testimonies: number;
  users: number;
  plans: number;
}

interface PaymentSourceItem {
  amount?: number;
  type?: string;
  reason?: string;
  createdAt?: string;
}

export default function DashboardPage() {
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummaryData[]>(
    [],
  );
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
    async function loadPayments() {
      try {
        // Fetch all payments (books, subscriptions, donations)
        const [bookRes, subRes, donationRes] = await Promise.all([
          api.get("/api/purchase/all?page=1&limit=100"),
          api.get("/api/subscription/all?page=1&limit=100"),
          api.get("/api/donations/all?page=1&limit=100"),
        ]);
        // Combine and aggregate by month/type
        const payments: Array<{
          amount: number;
          type: string;
          createdAt: string;
        }> = [];
        // Books
        (bookRes.data?.data ?? []).forEach((p: PaymentSourceItem) => {
          if (!p.createdAt) return;

          payments.push({
            amount: p.amount ?? 0,
            type: "tithe", // You may want to map this differently
            createdAt: p.createdAt,
          });
        });
        // Subscriptions
        (subRes.data?.data ?? []).forEach((s: PaymentSourceItem) => {
          if (!s.createdAt) return;

          payments.push({
            amount: s.amount ?? 0,
            type: s.type?.toLowerCase() ?? "other",
            createdAt: s.createdAt,
          });
        });
        // Donations
        (donationRes.data?.data ?? []).forEach((d: PaymentSourceItem) => {
          if (!d.createdAt) return;

          payments.push({
            amount: d.amount ?? 0,
            type: d.reason?.toLowerCase() ?? "other",
            createdAt: d.createdAt,
          });
        });
        // Group by month and type
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const summary: { [month: string]: { [type: string]: number } } = {};
        payments.forEach((p) => {
          const date = new Date(p.createdAt);
          const month = monthNames[date.getMonth()];
          if (!summary[month])
            summary[month] = { tithe: 0, gift: 0, offering: 0, other: 0 };
          if (["tithe", "gift", "offering", "other"].includes(p.type)) {
            summary[month][p.type] += p.amount;
          } else {
            summary[month]["other"] += p.amount;
          }
        });
        // Convert to chart data
        const chartData: PaymentSummaryData[] = Object.entries(summary).map(
          ([month, values]) => ({
            month,
            tithe: values.tithe,
            gift: values.gift,
            offering: values.offering,
            other: values.other,
          }),
        );
        setPaymentSummary(chartData);
      } catch {
        // Optionally handle error
      }
    }
    loadPayments();
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
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-indigo-600 rounded-2xl p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <TrendingUp size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">
              Welcome back, {user?.username ?? "Admin"}!
            </h1>
            <p className="text-indigo-200 text-sm mt-0.5">
              Here's what's happening with your church platform.
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 text-sm font-semibold">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Live Dashboard
        </div>
      </div>

      <YearlyPerformanceDashboard />

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse h-24"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <StatsCard key={card.label} {...card} />
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
