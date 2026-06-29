"use client";

import Link from "next/link";
import { Clock3, Crown } from "lucide-react";
import { toISO } from "@/lib/seo";
import type { ArticleCard } from "@/lib/premium/articles";

export function timeAgo(dateStr?: string | null) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(toISO(dateStr)).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Agora mesmo";
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d atrás`;
  return new Date(toISO(dateStr)).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function href(a: ArticleCard) {
  return `/app/ler/${a.slug}`;
}

function Meta({ a }: { a: ArticleCard }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-zinc-500">
      <Clock3 size={12} />
      <span>{timeAgo(a.created_at)}</span>
      {a.is_premium && <Crown size={11} className="text-[#c79bff]" />}
    </div>
  );
}

export function HeroCard({ a }: { a: ArticleCard }) {
  return (
    <Link href={href(a)} className="group block">
      <div className="relative w-full overflow-hidden rounded-3xl ring-1 ring-white/10 transition duration-300 group-hover:ring-white/25" style={{ aspectRatio: "16/10" }}>
        {a.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.image_url} alt={a.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <span className="mb-2 inline-block text-[11px] font-bold uppercase tracking-widest text-white/80">{a.category}</span>
          <h2 className="max-w-2xl text-[24px] font-extrabold leading-[1.12] tracking-tight text-white md:text-[32px]">{a.title}</h2>
          {a.excerpt && <p className="mt-2 hidden max-w-xl text-[14px] leading-relaxed text-zinc-300 md:line-clamp-2">{a.excerpt}</p>}
        </div>
        {a.is_premium && (
          <span className="pro-gradient absolute left-5 top-5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white">
            <Crown size={11} /> Exclusivo
          </span>
        )}
      </div>
    </Link>
  );
}

export function BigCard({ a }: { a: ArticleCard }) {
  return (
    <Link href={href(a)} className="group block transition duration-300 hover:-translate-y-1">
      <div className="relative w-full overflow-hidden rounded-2xl ring-1 ring-white/10 transition group-hover:ring-white/25" style={{ aspectRatio: "16/10" }}>
        {a.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.image_url} alt={a.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]" />
        )}
      </div>
      <div className="mt-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff5c8a]">{a.category}</span>
        <h3 className="mt-1 text-[18px] font-extrabold leading-snug tracking-tight text-zinc-100 transition group-hover:text-[#c79bff]">{a.title}</h3>
        {a.excerpt && <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-zinc-400">{a.excerpt}</p>}
        <div className="mt-2"><Meta a={a} /></div>
      </div>
    </Link>
  );
}

export function RowCard({ a }: { a: ArticleCard }) {
  return (
    <Link href={href(a)} className="group -mx-2 flex gap-4 rounded-2xl px-2 py-4 transition hover:bg-white/5">
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff5c8a]">{a.category}</span>
        <h3 className="mt-1 text-[16px] font-bold leading-snug tracking-tight text-zinc-100 transition group-hover:text-[#c79bff]">{a.title}</h3>
        <div className="mt-1.5"><Meta a={a} /></div>
      </div>
      {a.image_url && (
        <div className="relative h-[74px] w-[108px] shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.image_url} alt={a.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        </div>
      )}
    </Link>
  );
}

export function SmallCard({ a, index }: { a: ArticleCard; index?: number }) {
  return (
    <Link href={href(a)} className="group flex gap-3 border-b border-white/10 py-3 last:border-0">
      {typeof index === "number" && (
        <span className="w-6 shrink-0 select-none text-[20px] font-extrabold leading-none text-zinc-700">
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-zinc-100 transition group-hover:text-[#c79bff]">{a.title}</h3>
        <div className="mt-1"><Meta a={a} /></div>
      </div>
    </Link>
  );
}
