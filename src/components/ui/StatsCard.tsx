import { type LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'indigo' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'pink' | 'orange';
}

const colorMap = {
  indigo: { bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
  blue:   { bg: 'bg-blue-500',   light: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100' },
  green:  { bg: 'bg-green-500',  light: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-100' },
  yellow: { bg: 'bg-yellow-500', light: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' },
  red:    { bg: 'bg-red-500',    light: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-100' },
  purple: { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
  pink:   { bg: 'bg-pink-500',   light: 'bg-pink-50',   text: 'text-pink-600',   border: 'border-pink-100' },
  orange: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
};

export default function StatsCard({ label, value, icon: Icon, color = 'indigo' }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div className={`bg-white rounded-xl p-5 border ${c.border} flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`w-13 h-13 ${c.light} rounded-xl flex items-center justify-center shrink-0 p-3`}>
        <Icon className={c.text} size={24} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
