"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessagesSquare, ArrowUp, Loader2 } from "lucide-react";
import {
  ensureProfile,
  listPosts,
  listFollowingPosts,
  getPost,
  type Post,
  type CommunityProfile,
} from "@/lib/premium/community";
import PostCard from "@/components/premium/PostCard";
import PostComposer from "@/components/premium/PostComposer";
import StoriesBar from "@/components/premium/StoriesBar";
import { Spinner, PageHeader } from "@/components/premium/States";
import { supabase } from "@/lib/supabase/client";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

const PAGE = 20;

export default function ComunidadePage() {
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
    const io = new IntersectionObserver((e) => e[0].isIntersecting && loadMore(), {
      rootMargin: "700px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  // tempo real: novas publicações de outros membros → pílula
  useEffect(() => {
    const ch = supabase
      .channel("realtime-posts")
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
    <div className="mx-auto max-w-[640px]">
      <PageHeader
        eyebrow={<><MessagesSquare size={14} /> Comunidade</>}
        title="Opinião pública"
        subtitle="Compartilhe ideias e debata com outros assinantes da Monatiza."
      />

      {/* Stories (24h) */}
      <StoriesBar />

      {/* Para você | Seguindo */}
      <div className="mb-2 flex border-b border-white/10">
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

      {me !== null && (
        <PostComposer
          myProfile={me}
          onPosted={(p) => {
            seen.current.add(p.id);
            setPosts((prev) => [p, ...prev]);
          }}
        />
      )}

      {pendingIds.length > 0 && (
        <div className="sticky top-20 z-30 my-3 flex justify-center">
          <button
            onClick={showNew}
            className="inline-flex items-center gap-2 rounded-full bg-[#E0263B] px-5 py-2.5 text-[13px] font-bold text-white shadow-lg hover:bg-[#b91d2f]"
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
        <p className="py-12 text-center text-sm text-zinc-400">Seja o primeiro a publicar uma opinião.</p>
      )}
    </div>
  );
}
