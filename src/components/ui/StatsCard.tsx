import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?:
    | "indigo"
    | "blue"
    | "green"
    | "yellow"
    | "red"
    | "purple"
    | "pink"
    | "orange";
}

const colorMap = {
  indigo: {
    bg: "bg-indigo-500",
    light: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-100",
  },
  blue: {
    bg: "bg-blue-500",
    light: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
  },
  green: {
    bg: "bg-green-500",
    light: "bg-green-50",
    text: "text-green-600",
    border: "border-green-100",
  },
  yellow: {
    bg: "bg-yellow-500",
    light: "bg-yellow-50",
    text: "text-yellow-600",
    border: "border-yellow-100",
  },
  red: {
    bg: "bg-red-500",
    light: "bg-red-50",
    text: "text-red-600",
    border: "border-red-100",
  },
  purple: {
    bg: "bg-purple-500",
    light: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-100",
  },
  pink: {
    bg: "bg-pink-500",
    light: "bg-pink-50",
    text: "text-pink-600",
    border: "border-pink-100",
  },
  orange: {
    bg: "bg-orange-500",
    light: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-100",
  },
};

export default function StatsCard({
  label,
  value,
  icon: Icon,
  color = "indigo",
}: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:items-center sm:gap-4 sm:p-5 ${c.border}`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl p-3 sm:h-14 sm:w-14 ${c.light}`}
      >
        <Icon className={c.text} size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-gray-900 sm:text-2xl">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
