import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  action?: ReactNode;
  count?: number;
}

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  color = "bg-indigo-600",
  action,
  count,
}: PageHeaderProps) {
  return (
    <div
      className={`${color} mb-6 flex flex-col gap-4 rounded-2xl p-4 text-white sm:flex-row sm:items-center sm:justify-between sm:p-5`}
    >
      <div className="flex items-start gap-3 sm:items-center sm:gap-4">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-white/20 flex items-center justify-center sm:h-12 sm:w-12">
          <Icon size={24} className="text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-base font-bold sm:text-lg">{title}</h1>
            {count !== undefined && (
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-white/70 text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="w-full sm:w-auto">{action}</div>}
    </div>
  );
}
