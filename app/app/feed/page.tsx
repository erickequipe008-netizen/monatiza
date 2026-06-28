"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Rss, Loader2, ArrowUp } from "lucide-react";
import { fetchLatest, type ArticleCard } from "@/lib/premium/articles";
import { RowCard } from "@/components/premium/PremiumCards";
import { Spinner, PageHeader } from "@/components/premium/States";
import { supabase } from "@/lib/supabase/client";

const PAGE = 16;

export default function FeedPage() {
  const [items, setItems] = useState<ArticleCard[]>([]);
  const [pending, setPending] = useState<ArticleCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [done, setDone] = useState(false);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const seen = useRef<Set<number>>(new Set());

  useEffect(() => {
    (async () => {
      const first = await fetchLatest(PAGE);
      first.forEach((a) => seen.current.add(a.id));
      setItems(first);
      if (first.length < PAGE) setDone(true);
      setLoading(false);
    })();
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || done || items.length === 0) return;
    setLoadingMore(true);
    const before = items[items.length - 1]?.created_at ?? null;
    const next = await fetchLatest(PAGE, before);
    next.forEach((a) => seen.current.add(a.id));
    setItems((prev) => [...prev, ...next]);
    if (next.length < PAGE) setDone(true);
    setLoadingMore(false);
  }, [loadingMore, done, items]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { rootMargin: "700px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  // ── Tempo real: novas matérias publicadas entram numa "fila" ──
  useEffect(() => {
    const channel = supabase
      .channel("realtime-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "articles" },
        (payload) => {
          const a = payload.new as ArticleCard & { status?: string };
          if (!a || a.status !== "publicado" || seen.current.has(a.id)) return;
          seen.current.add(a.id);
          setPending((prev) => [a, ...prev.filter((p) => p.id !== a.id)]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function showNew() {
    setItems((prev) => [...pending, ...prev]);
    setPending([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <PageHeader eyebrow={<><Rss size={14} /> Feed em tempo real</>} title="Últimas notícias" />

      {/* pílula de novas matérias */}
      {pending.length > 0 && (
        <div className="sticky top-20 z-30 mb-4 flex justify-center">
          <button
            onClick={showNew}
            className="inline-flex items-center gap-2 rounded-full bg-[#E0263B] px-5 py-2.5 text-[13px] font-bold text-white shadow-lg transition hover:bg-[#b91d2f]"
          >
            <ArrowUp size={15} /> {pending.length} nova{pending.length > 1 ? "s" : ""} matéria{pending.length > 1 ? "s" : ""}
          </button>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid gap-x-10 md:grid-cols-2">
            {items.map((a) => (
              <RowCard key={a.id} a={a} />
            ))}
          </div>
          <div ref={sentinel} className="h-10" />
          {loadingMore && (
            <div className="flex justify-center py-6 text-zinc-400">
              <Loader2 className="animate-spin" size={20} />
            </div>
          )}
          {done && items.length > 0 && (
            <p className="py-8 text-center text-[13px] text-zinc-400">Você chegou ao fim. 🎉</p>
          )}
        </>
      )}
    </div>
  );
}
