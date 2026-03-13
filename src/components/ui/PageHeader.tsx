import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  action?: ReactNode;
  count?: number;
}

export default function PageHeader({
  title, subtitle, icon: Icon, color = 'bg-indigo-600', action, count,
}: PageHeaderProps) {
  return (
    <div className={`${color} rounded-2xl p-5 text-white flex items-center justify-between mb-6`}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">{title}</h1>
            {count !== undefined && (
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>
          {subtitle && <p className="text-white/70 text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
