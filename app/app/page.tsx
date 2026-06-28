"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, ArrowRight, MessagesSquare } from "lucide-react";
import { fetchLatest, fetchPremium, type ArticleCard } from "@/lib/premium/articles";
import { getRecommended } from "@/lib/premium/recommend";
import { ensureProfile, listPosts, type Post, type CommunityProfile } from "@/lib/premium/community";
import { HeroCard, BigCard, RowCard, SmallCard } from "@/components/premium/PremiumCards";
import PostCard from "@/components/premium/PostCard";
import PostComposer from "@/components/premium/PostComposer";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

const PAGE = 12;

function SectionTitle({ children, href }: { children: React.ReactNode; href?: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <h2 className="text-[13px] font-black uppercase tracking-[0.18em] text-zinc-900">{children}</h2>
      <div className="h-px flex-1 bg-zinc-200" />
      {href && (
        <Link href={href} className="flex items-center gap-1 text-[12px] font-bold text-zinc-500 hover:text-[#E0263B]">
          Ver tudo <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="aspect-[16/10] rounded-2xl bg-zinc-200" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-zinc-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PremiumHome() {
  const { user } = useSubscriber();
  const [latest, setLatest] = useState<ArticleCard[]>([]);
  const [premium, setPremium] = useState<ArticleCard[]>([]);
  const [recommended, setRecommended] = useState<ArticleCard[]>([]);
  const [me, setMe] = useState<CommunityProfile | null>(null);
  const [communityPosts, setCommunityPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [done, setDone] = useState(false);
  const sentinel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      const [l, p, r, prof, cposts] = await Promise.all([
        fetchLatest(PAGE + 5),
        fetchPremium(6),
        getRecommended(6),
        ensureProfile(),
        listPosts(4),
      ]);
      setLatest(l);
      setPremium(p);
      setRecommended(r);
      setMe(prof);
      setCommunityPosts(cposts);
      if (l.length < PAGE + 5) setDone(true);
      setLoading(false);
    })();
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || done || latest.length === 0) return;
    setLoadingMore(true);
    const before = latest[latest.length - 1]?.created_at ?? null;
    const next = await fetchLatest(PAGE, before);
    setLatest((prev) => [...prev, ...next]);
    if (next.length < PAGE) setDone(true);
    setLoadingMore(false);
  }, [loadingMore, done, latest]);

  // Feed infinito.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  if (loading) return <HomeSkeleton />;

  const hero = latest[0];
  const side = latest.slice(1, 5);
  const feed = latest.slice(5);
  const firstName = (user?.name || user?.email || "").split(" ")[0];

  return (
    <div className="space-y-12">
      {/* Saudação */}
      <div>
        <p className="pro-gradient-text text-[12px] font-bold uppercase tracking-[0.2em]">
          {firstName ? `Olá, ${firstName}` : "Boa leitura"}
        </p>
        <h1 className="mt-1 text-[26px] md:text-[32px] font-extrabold tracking-tight">
          Sua leitura de hoje
        </h1>
      </div>

      {/* Comunidade — publique e veja o que os assinantes estão dizendo */}
      <section>
        <SectionTitle href="/app/comunidade">
          <span className="inline-flex items-center gap-2">
            <MessagesSquare size={14} className="text-[#E0263B]" /> Comunidade
          </span>
        </SectionTitle>
        <div className="rounded-2xl border border-zinc-200 bg-white px-4">
          {me !== null && (
            <PostComposer
              myProfile={me}
              placeholder="No que você está pensando?"
              onPosted={(p) => setCommunityPosts((prev) => [p, ...prev].slice(0, 6))}
            />
          )}
          {communityPosts.length ? (
            communityPosts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                myId={user?.id}
                onDeleted={(id) => setCommunityPosts((prev) => prev.filter((x) => x.id !== id))}
              />
            ))
          ) : (
            <p className="py-6 text-center text-sm text-zinc-400">
              Seja o primeiro a publicar na comunidade.
            </p>
          )}
        </div>
      </section>

      {/* Destaque + lista lateral */}
      {hero && (
        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <HeroCard a={hero} />
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="mb-3 border-b border-zinc-200 pb-3 text-[11px] font-black uppercase tracking-widest text-zinc-400">
              Em destaque
            </h2>
            {side.map((a, i) => (
              <SmallCard key={a.id} a={a} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Recomendado para você */}
      {recommended.length > 0 && (
        <section>
          <SectionTitle>Recomendado para você</SectionTitle>
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.slice(0, 6).map((a) => (
              <BigCard key={`rec-${a.id}`} a={a} />
            ))}
          </div>
        </section>
      )}

      {/* Exclusivo (premium) */}
      {premium.length > 0 && (
        <section>
          <SectionTitle href="/app/exclusivo">
            <span className="inline-flex items-center gap-2">
              <Sparkles size={14} className="text-[#E0263B]" /> Exclusivo para assinantes
            </span>
          </SectionTitle>
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {premium.slice(0, 6).map((a) => (
              <BigCard key={a.id} a={a} />
            ))}
          </div>
        </section>
      )}

      {/* Últimas — feed infinito */}
      <section>
        <SectionTitle href="/app/feed">Últimas notícias</SectionTitle>
        <div className="grid gap-x-10 md:grid-cols-2">
          {feed.map((a) => (
            <RowCard key={a.id} a={a} />
          ))}
        </div>

        <div ref={sentinel} className="h-10" />
        {loadingMore && (
          <div className="flex justify-center py-6 text-zinc-400">
            <Loader2 className="animate-spin" size={20} />
          </div>
        )}
        {done && feed.length > 0 && (
          <p className="py-8 text-center text-[13px] text-zinc-400">Você está em dia. 🎉</p>
        )}
      </section>
    </div>
  );
}
