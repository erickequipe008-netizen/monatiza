"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ExternalLink } from "lucide-react";

interface Article {
  id: number;
  title: string;
  slug: string;
  category: string;
  status: string;
  created_at: string;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  publicado: { label: "Publicado", cls: "bg-green-100 text-green-700" },
  aprovado: { label: "Aprovado", cls: "bg-blue-100 text-blue-700" },
  em_analise: { label: "Em análise", cls: "bg-amber-100 text-amber-700" },
  rejeitado: { label: "Rejeitado", cls: "bg-red-100 text-red-700" },
};

export default function MinhasPublicacoes() {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("articles")
        .select("id, title, slug, category, status, created_at")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });
      setArticles((data as Article[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-10">
      <h1 className="text-2xl font-black text-[#0b0b0c] mb-1">Minhas publicações</h1>
      <p className="text-sm text-zinc-500 mb-6">Acompanhe o status de cada matéria enviada.</p>

      {loading ? (
        <p className="text-sm text-zinc-400">Carregando…</p>
      ) : articles.length === 0 ? (
        <div className="bg-white border border-[#E8E6E1] rounded-2xl p-10 text-center">
          <p className="text-zinc-500 font-semibold">Você ainda não enviou nenhuma publicação.</p>
          <Link href="/dashboard/novo" className="inline-block mt-4 bg-[#0b0b0c] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E0263B] transition">
            Nova publicação
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-[#E8E6E1] rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-zinc-400 border-b border-[#E8E6E1]">
                <th className="px-5 py-3 font-semibold">Título</th>
                <th className="px-5 py-3 font-semibold hidden sm:table-cell">Categoria</th>
                <th className="px-5 py-3 font-semibold hidden sm:table-cell">Data</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => {
                const s = STATUS[a.status] || STATUS.em_analise;
                return (
                  <tr key={a.id} className="border-b border-[#F0EFEC] last:border-0">
                    <td className="px-5 py-4 font-semibold text-[#0b0b0c] max-w-[280px] truncate">{a.title}</td>
                    <td className="px-5 py-4 text-sm text-zinc-500 hidden sm:table-cell">{a.category}</td>
                    <td className="px-5 py-4 text-sm text-zinc-400 hidden sm:table-cell">
                      {new Date(a.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {a.status === "publicado" && (
                        <Link
                          href={`/noticia/${a.slug}`}
                          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-[#E0263B] transition"
                        >
                          <ExternalLink size={14} /> Ver
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
