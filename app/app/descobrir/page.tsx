"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Compass, TrendingUp, Loader2 } from "lucide-react";
import { getTrendingHashtags } from "@/lib/premium/community";
import { fetchLatest, type ArticleCard } from "@/lib/premium/articles";
import { getMyInterests } from "@/lib/premium/events";
import { BigCard } from "@/components/premium/PremiumCards";
import { useLang } from "@/components/premium/useLang";

export default function ExplorarPage() {
  const { t } = useLang();
  const [trends, setTrends] = useState<{ tag: string; count: number }[]>([]);
  const [items, setItems] = useState<ArticleCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const cursor = useRef<string | null>(null);
  const seen = useRef<Set<number>>(new Set());

  // Ordena por afinidade (categorias que o usuário lê) + recência.
  const rank = useCallback((arts: ArticleCard[], cats: Set<string>) => {
    return [...arts].sort((a, b) => {
      const sa = cats.has((a.category || "").toString()) ? 1 : 0;
      const sb = cats.has((b.category || "").toString()) ? 1 : 0;
      if (sa !== sb) return sb - sa;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const [arts, it, tr] = await Promise.all([fetchLatest(24), getMyInterests(), getTrendingHashtags(10)]);
      if (!active) return;
      setTrends(tr);
      arts.forEach((a) => seen.current.add(a.id));
      cursor.current = arts.length ? arts[arts.length - 1].created_at ?? null : null;
      setItems(rank(arts, it.catSet));
      setShowMore(arts.length >= 24);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [rank]);

  const loadMore = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const [arts, it] = await Promise.all([fetchLatest(18, cursor.current), getMyInterests()]);
    const fresh = arts.filter((a) => !seen.current.has(a.id));
    fresh.forEach((a) => seen.current.add(a.id));
    if (arts.length) cursor.current = arts[arts.length - 1].created_at ?? null;
    setItems((prev) => [...prev, ...rank(fresh, it.catSet)]);
    if (arts.length < 18) setShowMore(false);
    setBusy(false);
  }, [busy, rank]);

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-5 flex items-center gap-2">
        <Compass size={20} className="text-[#1d9bf0]" />
        <h1 className="text-[20px] font-extrabold tracking-tight">{t("explore")}</h1>
      </div>

      {trends.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2.5 flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-zinc-500">
            <TrendingUp size={14} /> {t("trending")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {trends.map((tr) => (
              <Link
                key={tr.tag}
                href={`/app/busca?q=${encodeURIComponent(tr.tag)}`}
                className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[13px] font-bold text-zinc-100 transition hover:bg-white/10"
              >
                {tr.tag} <span className="ml-1 text-[11px] font-semibold text-zinc-500">{tr.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <h2 className="mb-4 text-[15px] font-extrabold text-zinc-100">{t("for_you")}</h2>

      {loading ? (
        <div className="flex justify-center py-12 text-zinc-400">
          <Loader2 className="animate-spin" size={22} />
        </div>
      ) : (
        <>
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => (
              <BigCard key={a.id} a={a} />
            ))}
          </div>
          {showMore && (
            <div className="flex justify-center py-8">
              <button
                onClick={loadMore}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-2.5 text-[14px] font-bold text-zinc-100 transition hover:bg-white/5 disabled:opacity-50"
              >
                {busy && <Loader2 size={15} className="animate-spin" />} {t("show_more")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
