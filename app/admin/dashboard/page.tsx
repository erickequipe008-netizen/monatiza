"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText, Eye, Users, Plus, ExternalLink, Crown, MessageSquare,
  Film, BadgeCheck, ArrowUpRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ARTICLE_LIST_COLUMNS } from "@/lib/articleFields";

type Stats = {
  activeSubscribers: number;
  totalSubscribers: number;
  members: number;
  posts: number;
  reels: number;
  pending: number;
};

const WD = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function DashboardPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [journalists, setJournalists] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [userName, setUserName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    load();
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  async function load() {
    const { data: { user, session } } = await getUserAndSession();
    if (user) setUserName(user.user_metadata?.name || user.email?.split("@")[0] || "Equipe");

    const { data } = await supabase
      .from("articles")
      .select(ARTICLE_LIST_COLUMNS)
      .order("created_at", { ascending: false });
    if (data) setArticles(data);

    const { count } = await supabase.from("journalists").select("*", { count: "exact", head: true });
    setJournalists(count || 0);

    if (session) {
      try {
        const res = await fetch("/api/admin/verifications", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const json = await res.json();
        if (json.stats) setStats(json.stats);
      } catch {/* ignore */}
    }
  }

  async function getUserAndSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return { data: { user: session?.user ?? null, session } };
  }

  const today = new Date().toISOString().split("T")[0];
  const todayCount = articles.filter((a) => a.created_at?.startsWith(today)).length;

  // matérias por categoria
  const byCategory = useMemo(() => {
    const m: Record<string, number> = {};
    articles.forEach((a) => { if (a.category) m[a.category] = (m[a.category] || 0) + 1; });
    return Object.entries(m).map(([k, v]) => ({ k, v })).sort((a, b) => b.v - a.v).slice(0, 7);
  }, [articles]);
  const catMax = Math.max(1, ...byCategory.map((c) => c.v));

  // atividade últimos 7 dias
  const last7 = useMemo(() => {
    const days: { label: string; n: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      days.push({ label: WD[d.getDay()], n: articles.filter((a) => a.created_at?.startsWith(key)).length });
    }
    return days;
  }, [articles]);
  const dayMax = Math.max(1, ...last7.map((d) => d.n));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const kpis = [
    { label: "Matérias", value: articles.length, sub: "no portal", color: "#0b0b0c", icon: FileText },
    { label: "Hoje", value: todayCount, sub: "publicadas", color: "#E0263B", icon: ArrowUpRight },
    { label: "Assinantes", value: stats?.activeSubscribers ?? "—", sub: "ativos", color: "#10B981", icon: Crown },
    { label: "Membros", value: stats?.members ?? "—", sub: "na comunidade", color: "#6366F1", icon: Users },
    { label: "Publicações", value: stats?.posts ?? "—", sub: "na comunidade", color: "#8B5CF6", icon: MessageSquare },
    { label: "Vídeos", value: stats?.reels ?? "—", sub: "reels", color: "#EC4899", icon: Film },
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <div className="mx-auto max-w-6xl space-y-8 px-5 py-8 md:px-8 md:py-10">

        {/* Saudação */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-l-4 border-[#E0263B] pl-5">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#999]">{greeting}</p>
            <h1 className="text-3xl font-extrabold leading-tight text-[#0b0b0c] md:text-4xl">{userName}</h1>
            <p className="mt-1 text-sm text-[#888]">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Portal online
          </span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="rounded-2xl border border-[#E8E6E1] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#999]">{k.label}</span>
                  <Icon size={15} style={{ color: k.color }} />
                </div>
                <p className="text-3xl font-extrabold leading-none" style={{ color: k.color }}>{k.value}</p>
                <p className="mt-1.5 text-[11px] text-[#bbb]">{k.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Conteúdo em duas colunas */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">

          {/* Coluna principal */}
          <div className="space-y-6">
            {/* Gráfico por categoria */}
            <div className="rounded-2xl border border-[#E8E6E1] bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#0b0b0c]">Matérias por categoria</h2>
              <p className="mb-5 text-xs text-[#999]">Distribuição do acervo publicado</p>
              <div className="space-y-3">
                {byCategory.map((c) => (
                  <div key={c.k} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 truncate text-[13px] font-semibold text-[#444]">{c.k}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#F0EDE8]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#E0263B] to-[#ff6b7e] transition-all duration-700 ease-out"
                        style={{ width: mounted ? `${(c.v / catMax) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="w-7 text-right text-[12px] font-bold tabular-nums text-[#999]">{c.v}</span>
                  </div>
                ))}
                {byCategory.length === 0 && <p className="text-sm text-[#bbb]">Sem dados ainda.</p>}
              </div>
            </div>

            {/* Últimas matérias */}
            <div className="overflow-hidden rounded-2xl border border-[#E8E6E1] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F0EDE8] px-6 py-5">
                <h2 className="text-base font-bold text-[#0b0b0c]">Últimas matérias</h2>
                <Link href="/admin/articles" className="flex items-center gap-1 text-xs font-semibold text-[#999] transition hover:text-[#E0263B]">
                  Ver todas <ExternalLink size={11} />
                </Link>
              </div>
              <div className="divide-y divide-[#F7F6F3]">
                {articles.slice(0, 7).map((a) => (
                  <Link key={a.id} href={`/admin/articles/${a.id}`} className="flex items-center gap-3 px-6 py-3.5 transition hover:bg-[#FAFAF8]">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0b0b0c] text-[10px] font-black text-white">
                      {(a.journalist_name || a.author || "?")[0]?.toUpperCase()}
                    </span>
                    <p className="min-w-0 flex-1 truncate text-sm font-bold text-[#0b0b0c]">{a.title}</p>
                    <span className="hidden shrink-0 rounded-md bg-[#F0EDE8] px-2 py-0.5 text-[11px] font-semibold text-[#666] sm:inline">{a.category}</span>
                    <span className="hidden shrink-0 text-[11px] tabular-nums text-[#aaa] md:inline">
                      {new Date(a.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </Link>
                ))}
                {articles.length === 0 && <p className="px-6 py-12 text-center text-sm text-[#bbb]">Nenhuma matéria ainda.</p>}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ações rápidas */}
            <div className="space-y-3">
              <Link href="/admin/articles/new" className="group flex items-center justify-between rounded-2xl bg-[#0b0b0c] px-5 py-4 transition hover:bg-[#E0263B]">
                <span className="font-bold text-white">Escrever matéria</span>
                <Plus size={18} className="text-white" />
              </Link>
              <Link href="/admin/articles" className="group flex items-center justify-between rounded-2xl border border-[#E8E6E1] bg-white px-5 py-4 transition hover:border-[#0b0b0c]">
                <span className="font-bold text-[#0b0b0c]">Minhas matérias</span>
                <Eye size={18} className="text-[#999]" />
              </Link>
              <Link href="/admin/journalists" className="group flex items-center justify-between rounded-2xl border border-[#E8E6E1] bg-white px-5 py-4 transition hover:border-[#6366F1]">
                <span className="font-bold text-[#0b0b0c]">Jornalistas <span className="text-[#bbb]">· {journalists}</span></span>
                <Users size={18} className="text-[#999]" />
              </Link>
            </div>

            {/* Verificações pendentes */}
            {stats && stats.pending > 0 && (
              <Link href="/admin/verificacoes" className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 transition hover:bg-amber-100">
                <BadgeCheck size={20} className="text-amber-600" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-800">{stats.pending} verificaç{stats.pending > 1 ? "ões" : "ão"} pendente{stats.pending > 1 ? "s" : ""}</p>
                  <p className="text-[12px] text-amber-700">Toque para revisar</p>
                </div>
              </Link>
            )}

            {/* Atividade 7 dias */}
            <div className="rounded-2xl border border-[#E8E6E1] bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#0b0b0c]">Atividade</h2>
              <p className="mb-5 text-xs text-[#999]">Publicações nos últimos 7 dias</p>
              <div className="flex h-28 items-end justify-between gap-2">
                {last7.map((d, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-md bg-gradient-to-t from-[#6366F1] to-[#a5b4fc] transition-all duration-700 ease-out"
                        style={{ height: mounted ? `${Math.max(6, (d.n / dayMax) * 100)}%` : "0%" }}
                        title={`${d.n} matéria(s)`}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-[#aaa]">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
