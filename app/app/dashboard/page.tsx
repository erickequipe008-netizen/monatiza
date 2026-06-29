"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, Clock, BookOpen, Bookmark, Heart, CalendarDays } from "lucide-react";
import { getStats, type DashboardStats } from "@/lib/premium/library";
import { Spinner, PageHeader } from "@/components/premium/States";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

function fmtMinutes(min: number) {
  if (min >= 60) return `${Math.floor(min / 60)}h ${min % 60}min`;
  return `${min} min`;
}

export default function DashboardPage() {
  const { user } = useSubscriber();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    (async () => setStats(await getStats()))();
  }, []);

  if (!stats) return <Spinner />;

  const cards = [
    { icon: Clock, label: "Tempo de leitura", value: fmtMinutes(stats.readingMinutes) },
    { icon: BookOpen, label: "Matérias lidas", value: String(stats.articlesRead) },
    { icon: Bookmark, label: "Salvos", value: String(stats.saved) },
    { icon: Heart, label: "Curtidos", value: String(stats.liked) },
    { icon: CalendarDays, label: "Dias como assinante", value: String(stats.daysSubscribed) },
  ];

  const maxCat = Math.max(1, ...stats.topCategories.map((c) => c.count));
  const firstName = (user?.name || user?.email || "").split(" ")[0];

  return (
    <div>
      <PageHeader
        eyebrow={<><LayoutDashboard size={14} /> Seu painel</>}
        title={firstName ? `Olá, ${firstName}` : "Seu painel"}
        subtitle="Acompanhe sua jornada de leitura na Monatiza."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <Icon size={20} className="text-[#E0263B]" />
              <p className="mt-4 text-[26px] font-black leading-none tracking-tight">{c.value}</p>
              <p className="mt-1.5 text-[12px] font-semibold text-zinc-500">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-[12px] font-black uppercase tracking-widest text-zinc-400">
          Categorias favoritas
        </h2>
        {stats.topCategories.length ? (
          <div className="mt-5 space-y-3">
            {stats.topCategories.map((c) => (
              <div key={c.category} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-[13px] font-semibold text-zinc-300">{c.category}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#E0263B]"
                    style={{ width: `${(c.count / maxCat) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-[12px] font-bold text-zinc-400">{c.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-400">
            Leia algumas matérias para descobrirmos suas categorias favoritas.
          </p>
        )}
      </div>
    </div>
  );
}
