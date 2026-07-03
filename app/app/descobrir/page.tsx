"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Compass, TrendingUp, Loader2, Sparkles } from "lucide-react";
import { listPosts, getTrendingHashtags, type Post } from "@/lib/premium/community";
import { fetchLatest, type ArticleCard } from "@/lib/premium/articles";
import { getMyInterests, extractTags, type Interests } from "@/lib/premium/events";
import { isHidden } from "@/lib/premium/prefs";
import PostCard from "@/components/premium/PostCard";
import QuoteOfDay from "@/components/premium/QuoteOfDay";
import { timeAgo } from "@/components/premium/PremiumCards";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

type FeedItem =
  | { kind: "post"; key: string; t: number; score: number; post: Post }
  | { kind: "article"; key: string; t: number; score: number; a: ArticleCard };

// Pontua cada conteúdo pela afinidade com o que o usuário demonstrou gostar.
function scorePost(p: Post, it: Interests): number {
  let s = 0;
  for (const tag of extractTags(p.content)) if (it.tagSet.has(tag)) s += 3;
  if (it.authors.has(p.user_id)) s += 4;
  s += Math.min(p.likeCount, 10) * 0.2; // leve empurrão do que engaja
  return s;
}
function scoreArticle(a: ArticleCard, it: Interests): number {
  let s = 0;
  const cat = (a.category || "").toString();
  if (cat && it.catSet.has(cat)) s += 3;
  return s;
}

export default function ExplorarPage() {
  const { user } = useSubscriber();
  const [trends, setTrends] = useState<{ tag: string; count: number }[]>([]);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [personalized, setPersonalized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const postCursor = useRef<string | null>(null);
  const artCursor = useRef<string | null>(null);

  const build = useCallback((posts: Post[], arts: ArticleCard[], it: Interests): FeedItem[] => {
    const now = Date.now();
    const recency = (iso?: string | null) => {
      const t = iso ? new Date(iso).getTime() : now;
      const days = (now - t) / 86_400_000;
      return Math.max(0, 3 - days * 0.15); // mais novo = pontua mais
    };
    const postItems: FeedItem[] = posts
      .filter((p) => !isHidden(p.user_id))
      .map((p) => ({ kind: "post", key: `p${p.id}`, t: new Date(p.created_at).getTime(), score: scorePost(p, it) + recency(p.created_at), post: p }));
    const artItems: FeedItem[] = arts.map((a) => ({
      kind: "article",
      key: `a${a.id}`,
      t: a.created_at ? new Date(a.created_at).getTime() : now,
      score: scoreArticle(a, it) + recency(a.created_at) + 0.4, // artigos entram no mix
      a,
    }));
    return [...postItems, ...artItems].sort((x, y) => y.score - x.score || y.t - x.t);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const [posts, arts, it, tr] = await Promise.all([
        listPosts(40),
        fetchLatest(30),
        getMyInterests(),
        getTrendingHashtags(12),
      ]);
      if (!active) return;
      setTrends(tr);
      setPersonalized(it.tags.length > 0 || it.categories.length > 0 || it.authors.size > 0);
      postCursor.current = posts.length ? posts[posts.length - 1].created_at : null;
      artCursor.current = arts.length ? arts[arts.length - 1].created_at ?? null : null;
      setItems(build(posts, arts, it));
      setShowMore(posts.length >= 40 || arts.length >= 30);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [build]);

  const loadMore = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const [posts, arts, it] = await Promise.all([
      listPosts(30, postCursor.current),
      fetchLatest(20, artCursor.current),
      getMyInterests(),
    ]);
    if (posts.length) postCursor.current = posts[posts.length - 1].created_at;
    if (arts.length) artCursor.current = arts[arts.length - 1].created_at ?? null;
    setItems((prev) => {
      const seen = new Set(prev.map((i) => i.key));
      const next = build(posts, arts, it).filter((i) => !seen.has(i.key));
      return [...prev, ...next];
    });
    if (posts.length < 30 && arts.length < 20) setShowMore(false);
    setBusy(false);
  }, [busy, build]);

  const removePost = (id: number) =>
    setItems((prev) => prev.filter((it) => !(it.kind === "post" && it.post.id === id)));

  return (
    <div className="mx-auto max-w-[640px]">
      <div className="mb-4 flex items-center gap-2">
        <Compass size={20} className="text-[#1d9bf0]" />
        <h1 className="text-[20px] font-extrabold tracking-tight">Explorar</h1>
      </div>
      <p className="mb-5 flex items-center gap-1.5 text-[13px] text-zinc-500">
        <Sparkles size={13} className="text-[#1d9bf0]" />
        {personalized
          ? "Selecionado para você — aprende com o que você curte, lê e segue."
          : "Tudo o que rola por aqui. Quanto mais você usa, mais personalizado fica."}
      </p>

      {/* Assuntos do momento */}
      {trends.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-2.5 flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-zinc-500">
            <TrendingUp size={14} /> Assuntos do momento
          </h2>
          <div className="flex flex-wrap gap-2">
            {trends.map((t) => (
              <Link
                key={t.tag}
                href={`/app/busca?q=${encodeURIComponent(t.tag)}`}
                className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[13px] font-bold text-zinc-100 transition hover:bg-white/10"
              >
                {t.tag} <span className="ml-1 text-[11px] font-semibold text-zinc-500">{t.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Frase do dia */}
      <div className="mb-2">
        <QuoteOfDay />
      </div>

      {/* Feed misturado: posts, vídeos e artigos */}
      {loading ? (
        <div className="flex justify-center py-12 text-zinc-400">
          <Loader2 className="animate-spin" size={22} />
        </div>
      ) : (
        <div>
          {items.map((it) =>
            it.kind === "post" ? (
              <PostCard key={it.key} post={it.post} myId={user?.id} onDeleted={removePost} />
            ) : (
              <Link
                key={it.key}
                href={`/app/ler/${it.a.slug}`}
                className="flex gap-3 border-b border-white/10 px-1 py-4 transition hover:bg-white/5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-[#1d9bf0]">
                    {it.a.category || "Notícia"} · Artigo
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug text-zinc-100">{it.a.title}</h3>
                  {it.a.excerpt && <p className="mt-1 line-clamp-2 text-[13px] text-zinc-400">{it.a.excerpt}</p>}
                  <p className="mt-1.5 text-[12px] text-zinc-500">{timeAgo(it.a.created_at || "")}</p>
                </div>
                {it.a.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.a.image_url} alt="" className="h-[84px] w-[84px] shrink-0 rounded-xl object-cover" />
                )}
              </Link>
            )
          )}

          {showMore && (
            <div className="flex justify-center py-6">
              <button
                onClick={loadMore}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-2.5 text-[14px] font-bold text-zinc-100 transition hover:bg-white/5 disabled:opacity-50"
              >
                {busy && <Loader2 size={15} className="animate-spin" />} Mostrar mais
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
