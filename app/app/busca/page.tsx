"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ARTICLE_LIST_COLUMNS } from "@/lib/articleFields";
import type { ArticleCard } from "@/lib/premium/articles";
import { RowCard } from "@/components/premium/PremiumCards";
import { Spinner, EmptyState, PageHeader } from "@/components/premium/States";

export default function BuscaPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ArticleCard[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim().replace(/[,()*%]/g, " ").trim();
    if (!term) return;
    setLoading(true);
    const { data } = await supabase
      .from("articles")
      .select(ARTICLE_LIST_COLUMNS)
      .eq("status", "publicado")
      .or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`)
      .order("created_at", { ascending: false })
      .limit(40);
    setResults((data as ArticleCard[]) || []);
    setLoading(false);
  }

  return (
    <div>
      <PageHeader eyebrow={<><Search size={14} /> Busca premium</>} title="Buscar" />

      <form onSubmit={run} className="relative mb-8 max-w-xl">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
          placeholder="O que você quer ler hoje?"
          className="w-full rounded-full border border-zinc-300 bg-white py-3.5 pl-12 pr-28 text-[15px] outline-none transition focus:border-zinc-500"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-[#0b0b0c] px-5 py-2 text-sm font-bold text-white hover:bg-[#E0263B]"
        >
          Buscar
        </button>
      </form>

      {loading ? (
        <Spinner />
      ) : results === null ? (
        <p className="text-sm text-zinc-400">Digite um termo para buscar em todo o acervo.</p>
      ) : results.length ? (
        <div className="grid gap-x-10 md:grid-cols-2">
          {results.map((a) => (
            <RowCard key={a.id} a={a} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Search} title="Nada encontrado." hint="Tente outras palavras." />
      )}
    </div>
  );
}
