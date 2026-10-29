"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ImageIcon, PenSquare, BookOpen, Star, ChevronRight } from "lucide-react";
import { ensureProfile, getRecommendedProfiles, type CommunityProfile } from "@/lib/premium/community";
import { fetchLatest, type ArticleCard } from "@/lib/premium/articles";
import { Avatar } from "@/components/premium/PostCard";
import { timeAgo } from "@/components/premium/PremiumCards";

const LILAC = "#8b5cf6";

/**
 * Home do app no mobile — mesma cara do app nativo: manchete, stories,
 * compositor, matéria em destaque, atalhos (Exclusivo/Revistas) e últimas.
 */
export default function MobileHome() {
  const [me, setMe] = useState<CommunityProfile | null>(null);
  const [people, setPeople] = useState<CommunityProfile[]>([]);
  const [articles, setArticles] = useState<ArticleCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [prof, ppl, arts] = await Promise.all([
        ensureProfile(),
        getRecommendedProfiles(10),
        fetchLatest(14),
      ]);
      setMe(prof);
      setPeople(ppl);
      setArticles(arts);
      setLoading(false);
    })();
  }, []);

  const featured = articles[0];
  const rest = articles.slice(1);
  const myInitial = (me?.display_name || me?.handle || "V").charAt(0).toUpperCase();

  return (
    <div className="-mt-2">
      {/* Manchete */}
      <h1 className="text-[30px] font-black leading-[1.05] tracking-tight">
        Seu mundo,
        <br />
        <span className="text-zinc-500">bem informado.</span>
      </h1>

      {/* Stories */}
      <div className="pro-scroll -mx-4 mt-5 flex gap-4 overflow-x-auto px-4 pb-1">
        <Link href="/app/descobrir" className="flex w-[64px] shrink-0 flex-col items-center gap-1.5">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/5 text-zinc-300">
            <Plus size={24} />
          </span>
          <span className="truncate text-[11.5px] text-zinc-400">Descobrir</span>
        </Link>
        {people.map((p) => (
          <Link
            key={p.user_id}
            href={`/app/perfil/${p.handle}`}
            className="flex w-[64px] shrink-0 flex-col items-center gap-1.5"
          >
            <span className="rounded-full p-[2.5px]" style={{ background: LILAC }}>
              <span className="block rounded-full border-2 border-[#0a0a0c]">
                <Avatar name={p.display_name || p.handle} url={p.avatar_url} size={56} />
              </span>
            </span>
            <span className="w-full truncate text-center text-[11.5px] text-zinc-300">
              {(p.display_name || p.handle || "").split(" ")[0]}
            </span>
          </Link>
        ))}
      </div>

      {/* Compositor */}
      <Link
        href="/app/comunidade"
        className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
      >
        {me?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={me.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-bold text-white" style={{ background: LILAC }}>
            {myInitial}
          </span>
        )}
        <span className="flex-1 text-[15px] text-zinc-500">Comece uma publicação…</span>
        <ImageIcon size={20} className="text-zinc-500" />
        <span className="flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ background: LILAC }}>
          <PenSquare size={17} />
        </span>
      </Link>

      {/* Matéria em destaque */}
      {featured && (
        <Link href={`/app/ler/${featured.slug}`} className="mt-6 block overflow-hidden rounded-2xl">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-white/5">
            {featured.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={featured.image_url} alt={featured.title} className="h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              {featured.category && (
                <span className="inline-block rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white" style={{ background: LILAC }}>
                  {featured.category}
                </span>
              )}
              <h2 className="mt-2 line-clamp-2 text-[19px] font-black leading-snug text-white">{featured.title}</h2>
            </div>
          </div>
        </Link>
      )}

      {/* Atalhos: Exclusivo + Revistas */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link href="/app/exclusivo" className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A24B]/15 text-[#C9A24B]">
            <Star size={20} />
          </span>
          <p className="mt-3 text-[16px] font-black text-white">Exclusivo</p>
          <p className="text-[12.5px] text-zinc-500">Para assinantes</p>
        </Link>
        <Link href="/app/revistas" className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ background: `${LILAC}30`, color: LILAC }}>
            <BookOpen size={20} />
          </span>
          <p className="mt-3 text-[16px] font-black text-white">Revistas</p>
          <p className="text-[12.5px] text-zinc-500">Edições especiais</p>
        </Link>
      </div>

      {/* Últimas notícias */}
      <div className="mt-7 mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-black uppercase tracking-[0.15em] text-zinc-500">Últimas notícias</h3>
        <Link href="/app/feed" className="flex items-center text-[12px] font-bold text-zinc-500">
          Ver todas <ChevronRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-[74px] w-[108px] shrink-0 animate-pulse rounded-xl bg-white/5" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
                <div className="h-3.5 w-full animate-pulse rounded bg-white/5" />
                <div className="h-3.5 w-2/3 animate-pulse rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-white/10">
          {rest.map((a) => (
            <Link key={a.id} href={`/app/ler/${a.slug}`} className="flex gap-3 py-3.5">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: LILAC }}>
                  {a.category} · {timeAgo(a.created_at || "")}
                </span>
                <h4 className="mt-1 line-clamp-3 text-[15px] font-bold leading-snug text-zinc-100">{a.title}</h4>
              </div>
              {a.image_url && (
                <div className="h-[74px] w-[108px] shrink-0 overflow-hidden rounded-xl bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
