"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowUp, TrendingUp, Newspaper, ArrowRight, ShieldCheck } from "lucide-react";
import {
  ensureProfile,
  listPosts,
  listFollowingPosts,
  getPost,
  getTrendingHashtags,
  getRecommendedProfiles,
  follow,
  unfollow,
  type Post,
  type CommunityProfile,
} from "@/lib/premium/community";
import { fetchLatest, type ArticleCard } from "@/lib/premium/articles";
import PostCard, { Avatar } from "@/components/premium/PostCard";
import PostComposer from "@/components/premium/PostComposer";
import QuoteOfDay from "@/components/premium/QuoteOfDay";
import VerifiedBadge from "@/components/premium/VerifiedBadge";
import { Spinner } from "@/components/premium/States";
import { timeAgo } from "@/components/premium/PremiumCards";
import { supabase } from "@/lib/supabase/client";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

const PAGE = 20;

// Botão Seguir compacto da coluna lateral.
function FollowSmall({ userId }: { userId: string }) {
  const [on, setOn] = useState(false);
  return (
    <button
      onClick={async () => {
        const n = !on;
        setOn(n);
        if (n) await follow(userId);
        else await unfollow(userId);
      }}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition ${
        on ? "border border-white/15 text-zinc-300" : "pro-gradient text-white hover:opacity-90"
      }`}
    >
      {on ? "Seguindo" : "Seguir"}
    </button>
  );
}

export default function PremiumHome() {
  const { user } = useSubscriber();
  const [me, setMe] = useState<CommunityProfile | null>(null);
  const [feed, setFeed] = useState<"all" | "following">("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingIds, setPendingIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [done, setDone] = useState(false);
  const sentinel = useRef<HTMLDivElement | null>(null);
  const seen = useRef<Set<number>>(new Set());

  // coluna direita
  const [trends, setTrends] = useState<{ tag: string; count: number }[]>([]);
  const [news, setNews] = useState<ArticleCard[]>([]);
  const [people, setPeople] = useState<CommunityProfile[]>([]);

  const fetchPage = useCallback(
    (limit: number, before?: string | null) =>
      feed === "following" ? listFollowingPosts(limit, before) : listPosts(limit, before),
    [feed]
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setDone(false);
    setPendingIds([]);
    (async () => {
      const prof = await ensureProfile();
      if (!active) return;
      setMe(prof);
      const first = await fetchPage(PAGE);
      if (!active) return;
      seen.current = new Set(first.map((p) => p.id));
      setPosts(first);
      if (first.length < PAGE) setDone(true);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [fetchPage]);

  // lateral: assuntos, notícias e sugestões (uma vez)
  useEffect(() => {
    (async () => {
      const [t, n, p] = await Promise.all([
        getTrendingHashtags(6),
        fetchLatest(5),
        getRecommendedProfiles(3),
      ]);
      setTrends(t);
      setNews(n);
      setPeople(p);
    })();
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || done || posts.length === 0) return;
    setLoadingMore(true);
    const before = posts[posts.length - 1]?.created_at ?? null;
    const next = await fetchPage(PAGE, before);
    next.forEach((p) => seen.current.add(p.id));
    setPosts((prev) => [...prev, ...next]);
    if (next.length < PAGE) setDone(true);
    setLoadingMore(false);
  }, [loadingMore, done, posts, fetchPage]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && loadMore(), { rootMargin: "700px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  // tempo real: novas publicações → pílula "N novas publicações"
  useEffect(() => {
    const ch = supabase
      .channel("realtime-home-posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (payload) => {
        const p = payload.new as { id: number; parent_id: number | null; user_id: string };
        if (!p || p.parent_id !== null || seen.current.has(p.id) || p.user_id === user?.id) return;
        seen.current.add(p.id);
        setPendingIds((prev) => [p.id, ...prev]);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user?.id]);

  async function showNew() {
    const ids = [...pendingIds];
    setPendingIds([]);
    const fetched = (await Promise.all(ids.map((id) => getPost(id)))).filter(Boolean) as Post[];
    setPosts((prev) => [...fetched, ...prev]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto flex max-w-[1040px] items-start gap-8">
      {/* ── FEED CENTRAL ── */}
      <div className="min-w-0 flex-1 lg:max-w-[620px]">
        <h1 className="mb-3 hidden text-[20px] font-extrabold tracking-tight lg:block">Início</h1>

        <div id="publicar">
          {me !== null && (
            <PostComposer
              myProfile={me}
              placeholder="No que você está pensando?"
              onPosted={(p) => {
                seen.current.add(p.id);
                setPosts((prev) => [p, ...prev]);
              }}
            />
          )}
        </div>

        {/* Para você | Seguindo */}
        <div className="sticky top-16 z-20 flex border-b border-white/10 bg-[#0a0a0c]/90 backdrop-blur lg:top-0">
          {([
            { key: "all", label: "Para você" },
            { key: "following", label: "Seguindo" },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setFeed(t.key)}
              className={`relative flex-1 py-3 text-[13.5px] font-bold transition ${
                feed === t.key ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.label}
              {feed === t.key && <span className="pro-gradient absolute inset-x-10 bottom-0 h-[3px] rounded-full" />}
            </button>
          ))}
        </div>

        {pendingIds.length > 0 && (
          <div className="sticky top-28 z-30 my-3 flex justify-center lg:top-14">
            <button
              onClick={showNew}
              className="pro-gradient inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold text-white shadow-lg hover:opacity-90"
            >
              <ArrowUp size={15} /> {pendingIds.length} nova{pendingIds.length > 1 ? "s" : ""} publicaç
              {pendingIds.length > 1 ? "ões" : "ão"}
            </button>
          </div>
        )}

        {loading ? (
          <Spinner />
        ) : posts.length ? (
          <div>
            {posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                myId={user?.id}
                onDeleted={(id) => setPosts((prev) => prev.filter((x) => x.id !== id))}
              />
            ))}
            <div ref={sentinel} className="h-10" />
            {loadingMore && (
              <div className="flex justify-center py-6 text-zinc-400">
                <Loader2 className="animate-spin" size={20} />
              </div>
            )}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-zinc-400">
            {feed === "following" ? "Siga pessoas para ver as publicações delas aqui." : "Seja o primeiro a publicar."}
          </p>
        )}
      </div>

      {/* ── COLUNA DIREITA ── */}
      <aside className="sticky top-6 hidden w-[320px] shrink-0 space-y-5 xl:block">
        <QuoteOfDay />

        {trends.length > 0 && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-3 flex items-center gap-2 text-[15px] font-extrabold text-white">
              <TrendingUp size={16} className="text-[#9B72CB]" /> Assuntos do momento
            </h2>
            <div className="space-y-2.5">
              {trends.map((t) => (
                <Link key={t.tag} href={`/app/busca?q=${encodeURIComponent(t.tag)}`} className="block">
                  <p className="text-[14px] font-bold text-zinc-100 hover:underline">{t.tag}</p>
                  <p className="text-[12px] text-zinc-500">{t.count} publicaç{t.count === 1 ? "ão" : "ões"} recentes</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="mb-3 flex items-center gap-2 text-[15px] font-extrabold text-white">
            <Newspaper size={16} className="text-[#FF5C8A]" /> Últimas notícias
          </h2>
          <div className="space-y-3.5">
            {news.map((a) => (
              <Link key={a.id} href={`/app/ler/${a.slug}`} className="group block">
                <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                  {a.category} · {timeAgo(a.created_at || "")}
                </p>
                <p className="line-clamp-2 text-[14px] font-bold leading-snug text-zinc-100 group-hover:underline">
                  {a.title}
                </p>
              </Link>
            ))}
          </div>
          <Link href="/app/feed" className="pro-gradient-text mt-3 inline-flex items-center gap-1 text-[13px] font-bold">
            Ver todas <ArrowRight size={13} />
          </Link>
        </section>

        {people.length > 0 && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-3 text-[15px] font-extrabold text-white">Quem seguir</h2>
            <div className="space-y-3">
              {people.map((p) => (
                <div key={p.user_id} className="flex items-center gap-3">
                  <Link href={`/app/perfil/${p.handle}`} className="flex min-w-0 flex-1 items-center gap-2.5">
                    <Avatar name={p.display_name || p.handle} url={p.avatar_url} size={40} />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1 truncate text-[14px] font-bold text-zinc-100">
                        {p.display_name || p.handle}
                        {p.verified && <VerifiedBadge size={12} />}
                      </span>
                      <span className="block truncate text-[12px] text-zinc-500">@{p.handle}</span>
                    </span>
                  </Link>
                  <FollowSmall userId={p.user_id} />
                </div>
              ))}
            </div>
          </section>
        )}

        {me && !me.verified && (
          <Link
            href="/app/verificacao"
            className="block rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.06]"
          >
            <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-white">
              <ShieldCheck size={16} className="text-[#C9A24B]" /> Selo de reconhecimento
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">
              Destaque seu perfil com o selo dourado e tenha mais alcance.
            </p>
            <span className="pro-gradient-text mt-2 inline-flex items-center gap-1 text-[13px] font-bold">
              Saiba mais <ArrowRight size={13} />
            </span>
          </Link>
        )}
      </aside>
    </div>
  );
}
