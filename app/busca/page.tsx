"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Clock3 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ARTICLE_LIST_COLUMNS } from "@/lib/articleFields";
import { toISO } from "@/lib/seo";

interface A {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  image_url?: string | null;
  category?: string | null;
  created_at?: string | null;
  is_premium?: boolean | null;
}

function timeAgo(d?: string | null) {
  if (!d) return "";
  const diff = Date.now() - new Date(toISO(d)).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Agora mesmo";
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

function BuscaInner() {
  const params = useSearchParams();
  const initialQ = params.get("q") || "";
  const [q, setQ] = useState(initialQ);
  const [results, setResults] = useState<A[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function doSearch(term: string) {
    const t = term.trim().replace(/[,()*%]/g, " ").trim();
    if (!t) {
      setResults([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("articles")
      .select(ARTICLE_LIST_COLUMNS)
      .eq("status", "publicado")
      .or(`title.ilike.%${t}%,excerpt.ilike.%${t}%`)
      .order("created_at", { ascending: false })
      .limit(40);
    setResults((data as A[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    if (initialQ) doSearch(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  return (
    <div className="bg-white min-h-screen text-black">
      <main className="max-w-[900px] mx-auto px-4 md:px-5 py-10 md:py-14">
        <h1 className="font-serif text-[28px] md:text-[36px] font-black tracking-tight mb-6">Buscar</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const u = new URL(window.location.href);
            u.searchParams.set("q", q);
            window.history.replaceState({}, "", u.toString());
            doSearch(q);
          }}
          className="relative mb-10"
        >
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            placeholder="Pesquisar matérias…"
            className="w-full rounded-full border border-zinc-300 py-3.5 pl-12 pr-28 text-[15px] outline-none transition focus:border-black"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-black px-5 py-2 text-sm font-bold text-white hover:bg-red-600"
          >
            Buscar
          </button>
        </form>

        {loading ? (
          <p className="text-sm text-zinc-400">Buscando…</p>
        ) : results === null ? (
          <p className="text-sm text-zinc-400">Digite um termo para pesquisar.</p>
        ) : results.length ? (
          <div className="divide-y divide-zinc-100">
            {results.map((a) => (
              <Link key={a.id} href={`/noticia/${a.slug}`} className="group flex gap-5 py-5">
                {a.image_url && (
                  <div className="relative h-[80px] w-[120px] shrink-0 overflow-hidden rounded">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.image_url} alt={a.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-600">{a.category}</span>
                  <h2 className="mt-1 font-serif text-[18px] font-bold leading-snug group-hover:text-red-600">{a.title}</h2>
                  {a.excerpt && <p className="mt-1 line-clamp-2 text-[13px] text-zinc-500">{a.excerpt}</p>}
                  <span className="mt-1.5 flex items-center gap-1 text-[11px] text-zinc-400">
                    <Clock3 size={11} /> {timeAgo(a.created_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400">Nenhuma matéria encontrada para “{q}”.</p>
        )}
      </main>
    </div>
  );
}

export default function BuscaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <BuscaInner />
    </Suspense>
  );
}
