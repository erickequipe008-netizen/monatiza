import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  color?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  color = "bg-gray-50",
}: StatCardProps) {
  return (
    <div className="
      bg-white border border-gray-100
      rounded-2xl p-5
      hover:shadow-sm transition
    ">
      <div className="flex items-start justify-between mb-4">
        <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wide">
          {title}
        </span>
        <div className={`${color} p-2 rounded-xl`}>
          {icon}
        </div>
      </div>
      <div className="text-[28px] font-black text-black leading-none">
        {value}
      </div>
      {trend && (
        <p className="text-[11px] text-gray-400 mt-2">{trend}</p>
      )}
    </div>
  );
}