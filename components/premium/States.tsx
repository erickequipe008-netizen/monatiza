"use client";

import { Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function Spinner() {
  return (
    <div className="flex justify-center py-16 text-zinc-400">
      <Loader2 className="animate-spin" size={22} />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon?: LucideIcon;
  title: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center">
      {Icon && <Icon size={34} className="mx-auto mb-3 text-zinc-600" />}
      <p className="font-bold text-zinc-300">{title}</p>
      {hint && <p className="mt-1 text-sm text-zinc-500">{hint}</p>}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-8">
      <p className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-[#9B72CB]">
        {eyebrow}
      </p>
      <h1 className="mt-1 text-[28px] font-extrabold tracking-tight md:text-[34px]">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-zinc-400">{subtitle}</p>}
    </header>
  );
}
