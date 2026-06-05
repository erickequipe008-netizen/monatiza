"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText, Eye, Users, TrendingUp, Plus,
  MoreHorizontal, ExternalLink,
} from "lucide-react";

import PageHeader   from "@/components/layout/PageHeader";
import StatCard     from "@/components/dashboard/StatCard";
import { supabase } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [articles,      setArticles]      = useState<any[]>([]);
  const [total,         setTotal]         = useState(0);
  const [journalists,   setJournalists]   = useState(0);
  const [todayArticles, setTodayArticles] = useState(0);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setArticles(data);
      setTotal(data.length);
      const today = new Date().toISOString().split("T")[0];
      setTodayArticles(data.filter(a => a.created_at?.startsWith(today)).length);
    }

    const { count } = await supabase
      .from("journalists")
      .select("*", { count: "exact", head: true });

    setJournalists(count || 0);
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral do portal"
        action={
          <Link href="/admin/articles/new">
            <button className="
              flex items-center gap-1.5
              bg-black text-white
              px-4 py-2 rounded-xl
              text-[13px] font-semibold
              hover:opacity-80 transition
            ">
              <Plus size={14} />
              Nova matéria
            </button>
          </Link>
        }
      />

      <div className="p-8 space-y-8">

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Matérias"
            value={total}
            icon={<FileText size={15} className="text-blue-500" />}
            color="bg-blue-50"
            trend="Total publicadas"
          />
          <StatCard
            title="Hoje"
            value={todayArticles}
            icon={<Eye size={15} className="text-green-500" />}
            color="bg-green-50"
            trend="Publicadas hoje"
          />
          <StatCard
            title="Jornalistas"
            value={journalists}
            icon={<Users size={15} className="text-purple-500" />}
            color="bg-purple-50"
            trend="Ativos"
          />
          <StatCard
            title="Portal"
            value="Online"
            icon={<TrendingUp size={15} className="text-emerald-500" />}
            color="bg-emerald-50"
            trend="Status operacional"
          />
        </div>

        {/* TABLE */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">

          {/* Table header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-bold text-black">Últimas matérias</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Acompanhe as publicações recentes</p>
            </div>
            <Link
              href="/admin/articles"
              className="text-[12px] text-gray-400 hover:text-black flex items-center gap-1 transition font-medium"
            >
              Ver todas <ExternalLink size={11} />
            </Link>
          </div>

          {articles.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <FileText size={24} className="text-gray-300" />
              </div>
              <p className="text-[13px] font-semibold text-gray-400">Nenhuma matéria ainda.</p>
              <p className="text-[12px] text-gray-300 mt-1">As publicações aparecerão aqui.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  {["Título", "Categoria", "Autor", "Data", ""].map(h => (
                    <th key={h} className="
                      px-6 py-3
                      text-left text-[11px] font-semibold
                      text-gray-400 uppercase tracking-wider
                    ">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {articles.slice(0, 8).map(a => (
                  <tr
                    key={a.id}
                    className="hover:bg-gray-50/60 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <p className="text-[13px] font-semibold text-black truncate max-w-[260px] group-hover:text-gray-700 transition-colors">
                        {a.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="
                        inline-block px-2.5 py-1
                        bg-gray-100 text-gray-600
                        rounded-lg text-[11px] font-semibold
                        group-hover:bg-gray-200 transition-colors
                      ">
                        {a.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-gray-500">
                            {(a.journalist_name || a.author || "?")[0]?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-500">{a.journalist_name || a.author}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[12px] text-gray-400 tabular-nums">
                        {new Date(a.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/articles/${a.id}`}>
                        <button className="
                          p-1.5 rounded-lg
                          hover:bg-gray-100 transition
                          text-gray-300 hover:text-black
                          opacity-0 group-hover:opacity-100
                        ">
                          <MoreHorizontal size={15} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Table footer */}
          {articles.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-50 bg-gray-50/40 flex items-center justify-between">
              <p className="text-[11px] text-gray-400">
                Mostrando {Math.min(8, articles.length)} de {articles.length} matérias
              </p>
              <Link
                href="/admin/articles"
                className="text-[11px] text-gray-500 hover:text-black font-medium transition"
              >
                Ver todas →
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}