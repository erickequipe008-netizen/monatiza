"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import PageHeader from "@/components/layout/PageHeader";
import { Check, X, Eye, Loader2, Inbox } from "lucide-react";

interface Article {
  id: number;
  title: string;
  slug: string;
  category: string;
  author: string;
  journalist_name: string;
  description: string;
  content: string;
  created_at: string;
}

export default function AprovacaoPage() {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [open, setOpen] = useState<Article | null>(null);
  const [acting, setActing] = useState<number | null>(null);

  async function load() {
    const { data } = await supabase
      .from("articles")
      .select("id, title, slug, category, author, journalist_name, description, content, created_at")
      .eq("status", "em_analise")
      .order("created_at", { ascending: true });
    setArticles((data as Article[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function decide(id: number, status: "publicado" | "rejeitado") {
    setActing(id);
    const { error } = await supabase.from("articles").update({ status }).eq("id", id);
    if (error) {
      alert("Erro: " + error.message);
      setActing(null);
      return;
    }
    setArticles((prev) => prev.filter((a) => a.id !== id));
    setOpen(null);
    setActing(null);
  }

  return (
    <>
      <PageHeader title="Aprovação" description="Publicações de jornalistas aguardando análise" />

      <div className="p-6 md:p-8 max-w-3xl">
        {loading ? (
          <p className="text-sm text-zinc-400">Carregando…</p>
        ) : articles.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
            <Inbox size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-semibold">Nenhuma publicação em análise.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((a) => (
              <div key={a.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#E0263B]">{a.category}</span>
                    <h3 className="text-[15px] font-bold text-black leading-snug mt-1">{a.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {a.journalist_name || a.author} · {new Date(a.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <button
                    onClick={() => setOpen(a)}
                    className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[13px] font-semibold hover:border-gray-400 transition"
                  >
                    <Eye size={14} /> Ver conteúdo
                  </button>
                  <Link
                    href={`/admin/articles/${a.id}`}
                    className="border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[13px] font-semibold hover:border-gray-400 transition"
                  >
                    Editar
                  </Link>
                  <div className="flex-1" />
                  <button
                    onClick={() => decide(a.id, "rejeitado")}
                    disabled={acting === a.id}
                    className="flex items-center gap-1.5 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-[13px] font-semibold hover:bg-red-50 transition disabled:opacity-50"
                  >
                    <X size={14} /> Rejeitar
                  </button>
                  <button
                    onClick={() => decide(a.id, "publicado")}
                    disabled={acting === a.id}
                    className="flex items-center gap-1.5 bg-[#0b0b0c] text-white px-4 py-1.5 rounded-lg text-[13px] font-semibold hover:bg-[#E0263B] transition disabled:opacity-50"
                  >
                    {acting === a.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Aprovar e publicar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de visualização */}
      {open && (
        <div className="fixed inset-0 z-[999] bg-black/60 flex items-start justify-center overflow-y-auto p-4 md:p-10">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#E0263B]">{open.category}</span>
                <h2 className="text-2xl font-black text-black leading-tight mt-1">{open.title}</h2>
                <p className="text-xs text-gray-400 mt-1">{open.journalist_name || open.author}</p>
              </div>
              <button onClick={() => setOpen(null)} className="text-gray-400 hover:text-black">
                <X size={22} />
              </button>
            </div>
            {open.description && <p className="text-gray-600 italic border-l-2 border-[#E0263B] pl-3 mb-4">{open.description}</p>}
            <div className="text-[15px] leading-relaxed text-gray-800 whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
              {open.content}
            </div>
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => decide(open.id, "rejeitado")}
                disabled={acting === open.id}
                className="flex items-center gap-1.5 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-red-50 transition disabled:opacity-50"
              >
                <X size={14} /> Rejeitar
              </button>
              <div className="flex-1" />
              <button
                onClick={() => decide(open.id, "publicado")}
                disabled={acting === open.id}
                className="flex items-center gap-1.5 bg-[#0b0b0c] text-white px-5 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#E0263B] transition disabled:opacity-50"
              >
                {acting === open.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Aprovar e publicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
