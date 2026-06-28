"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Eye, Users, Plus, ExternalLink, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ARTICLE_LIST_COLUMNS } from "@/lib/articleFields";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/dashboard/StatCard";

export default function DashboardPage() {
  const [articles,      setArticles]      = useState<any[]>([]);
  const [total,         setTotal]         = useState(0);
  const [journalists,   setJournalists]   = useState(0);
  const [todayArticles, setTodayArticles] = useState(0);
  const [userName,      setUserName]      = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserName(user.user_metadata?.name || user.email?.split("@")[0] || "Jornalista");
    }

    const { data } = await supabase
      .from("articles")
      .select(ARTICLE_LIST_COLUMNS)
      .order("created_at", { ascending: false });

    if (data) {
      setArticles(data);
      setTotal(data.length);
      const today = new Date().toISOString().split("T")[0];
      setTodayArticles(data.filter((a: any) => a.created_at?.startsWith(today)).length);
    }

    const { count } = await supabase
      .from("journalists")
      .select("*", { count: "exact", head: true });

    setJournalists(count || 0);
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }} className="min-h-screen bg-[#F7F6F3]">

      <div className="px-8 py-10 max-w-6xl mx-auto space-y-10">

        {/* ── Saudação ── */}
        <div className="border-l-4 border-[#E0263B] pl-5">
          <p className="text-xs uppercase tracking-[0.35em] text-[#999] mb-1" style={{ fontFamily: "sans-serif" }}>
            {greeting}
          </p>
          <h1 className="text-4xl font-bold text-[#0b0b0c] leading-tight">
            {userName}
          </h1>
          <p className="text-sm text-[#777] mt-1" style={{ fontFamily: "sans-serif" }}>
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Matérias publicadas", value: total,         sub: "no portal",       accent: "#0b0b0c" },
            { label: "Publicadas hoje",      value: todayArticles, sub: "nesta edição",    accent: "#E0263B" },
            { label: "Jornalistas ativos",   value: journalists,   sub: "na redação",      accent: "#6366F1" },
            { label: "Status do portal",     value: "●",           sub: "online e estável",accent: "#10B981" },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-2xl border border-[#E8E6E1] px-5 py-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-[#999] mb-3" style={{ fontFamily: "sans-serif" }}>
                {k.label}
              </p>
              <p className="text-4xl font-bold leading-none" style={{ color: k.accent }}>
                {k.value}
              </p>
              <p className="text-xs text-[#bbb] mt-2" style={{ fontFamily: "sans-serif" }}>{k.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Ações rápidas ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/admin/articles/new" className="group bg-[#0b0b0c] rounded-2xl px-6 py-5 flex items-center justify-between hover:bg-[#E0263B] transition-colors duration-200">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-1" style={{ fontFamily: "sans-serif" }}>Ação</p>
              <p className="text-white font-bold text-base">Escrever matéria</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition">
              <FileText size={18} className="text-white" />
            </div>
          </Link>

          <Link href="/admin/articles" className="group bg-white border border-[#E8E6E1] rounded-2xl px-6 py-5 flex items-center justify-between hover:border-[#0b0b0c] transition-colors duration-200">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#999] mb-1" style={{ fontFamily: "sans-serif" }}>Arquivo</p>
              <p className="text-[#0b0b0c] font-bold text-base">Minhas matérias</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F7F6F3] flex items-center justify-center group-hover:bg-[#0b0b0c] transition">
              <Eye size={18} className="text-[#999] group-hover:text-white transition" />
            </div>
          </Link>

          <Link href="/admin/journalists" className="group bg-white border border-[#E8E6E1] rounded-2xl px-6 py-5 flex items-center justify-between hover:border-[#6366F1] transition-colors duration-200">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#999] mb-1" style={{ fontFamily: "sans-serif" }}>Equipe</p>
              <p className="text-[#0b0b0c] font-bold text-base">Jornalistas</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F7F6F3] flex items-center justify-center group-hover:bg-[#EEF2FF] transition">
              <Users size={18} className="text-[#999] group-hover:text-[#6366F1] transition" />
            </div>
          </Link>
        </div>

        {/* ── Tabela de matérias ── */}
        <div className="bg-white rounded-2xl border border-[#E8E6E1] shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#F0EDE8] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0b0b0c]">Últimas matérias</h2>
              <p className="text-xs text-[#999] mt-0.5" style={{ fontFamily: "sans-serif" }}>
                Acompanhe as publicações recentes
              </p>
            </div>
            <Link
              href="/admin/articles"
              className="flex items-center gap-1 text-xs font-semibold text-[#999] hover:text-[#E0263B] transition-colors"
              style={{ fontFamily: "sans-serif" }}
            >
              Ver todas <ExternalLink size={11} />
            </Link>
          </div>

          {articles.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#F7F6F3] border border-[#E8E6E1] flex items-center justify-center mx-auto mb-4">
                <FileText size={22} className="text-[#ccc]" />
              </div>
              <p className="text-sm font-bold text-[#999]" style={{ fontFamily: "sans-serif" }}>Nenhuma matéria ainda.</p>
              <p className="text-xs text-[#bbb] mt-1" style={{ fontFamily: "sans-serif" }}>As publicações aparecerão aqui.</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F7F6F3] border-b border-[#F0EDE8]">
                    {["Título", "Categoria", "Autor", "Data", ""].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider"
                        style={{ fontFamily: "sans-serif" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F6F3]">
                  {articles.slice(0, 8).map((a: any) => (
                    <tr key={a.id} className="group hover:bg-[#FAFAF8] transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#0b0b0c] truncate max-w-[260px] leading-snug">
                          {a.title}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                          style={{ fontFamily: "sans-serif", background: "#F0EDE8", color: "#666" }}
                        >
                          {a.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black text-white"
                            style={{ background: "#0b0b0c", fontFamily: "sans-serif" }}
                          >
                            {(a.journalist_name || a.author || "?")[0]?.toUpperCase()}
                          </div>
                          <p className="text-xs text-[#666]" style={{ fontFamily: "sans-serif" }}>
                            {a.journalist_name || a.author}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-[#aaa] tabular-nums" style={{ fontFamily: "sans-serif" }}>
                          {new Date(a.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/articles/${a.id}`}>
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#ccc] group-hover:text-[#E0263B] transition-colors opacity-0 group-hover:opacity-100"
                            style={{ fontFamily: "sans-serif" }}
                          >
                            Editar →
                          </span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="px-6 py-3 border-t border-[#F0EDE8] bg-[#F7F6F3] flex items-center justify-between">
                <p className="text-[11px] text-[#aaa]" style={{ fontFamily: "sans-serif" }}>
                  Mostrando {Math.min(8, articles.length)} de {articles.length} matérias
                </p>
                <Link
                  href="/admin/articles"
                  className="text-[11px] font-semibold text-[#666] hover:text-[#E0263B] transition-colors"
                  style={{ fontFamily: "sans-serif" }}
                >
                  Ver todas →
                </Link>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}