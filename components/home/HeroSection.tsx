"use client";

import Link from "next/link";
import { Clock3 } from "lucide-react";
import { timeAgo } from "@/lib/timeAgo";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  category: string;
  image_url?: string;
  created_at?: string;
}

interface HeroSectionProps {
  dark: boolean;
  featured: Article;
  sideArticles: Article[];
}

export function HeroSection({ dark, featured, sideArticles }: HeroSectionProps) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-[1fr_1px_300px] gap-0 pb-0 border-b ${dark ? "border-zinc-800" : "border-zinc-200"}`}>
      {/* MANCHETE PRINCIPAL */}
      <div className={`pr-0 lg:pr-7 pb-6 lg:pb-7 border-b lg:border-b-0 lg:border-r ${dark ? "border-zinc-800" : "border-zinc-200"}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-red-600 text-[11px] font-black uppercase tracking-widest">{featured.category}</span>
          <span className={`text-[11px] flex items-center gap-1 ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
            <Clock3 size={11} /> {timeAgo(featured.created_at)}
          </span>
        </div>
        <Link href={`/noticia/${featured.slug}`} className="group block">
          <h1 className="text-[26px] sm:text-[34px] md:text-[44px] leading-[1.08] font-serif font-black tracking-tight mb-4 group-hover:text-red-600 transition-colors">
            {featured.title}
          </h1>
        </Link>
        <p className={`text-[15px] leading-relaxed mb-5 max-w-[600px] ${dark ? "text-zinc-400" : "text-zinc-600"}`}>
          {featured.excerpt}
        </p>
        <Link href={`/noticia/${featured.slug}`}>
          <div className="relative w-full overflow-hidden group" style={{ aspectRatio: "16/9" }}>
            <img
              src={featured.image_url || "https://images.unsplash.com/photo-1498050108023-c5249f4df085"}
              alt={featured.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
          </div>
        </Link>
      </div>

      {/* DIVISOR VISUAL */}
      <div className={`hidden lg:block w-px ${dark ? "bg-zinc-800" : "bg-zinc-200"}`} />

      {/* COLUNA LATERAL */}
      <div className="pl-0 lg:pl-7 pt-2 lg:pt-0 flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
        {sideArticles.map((item) => (
          <Link
            href={`/noticia/${item.slug}`}
            key={item.id}
            className="group grid grid-cols-[minmax(0,1fr)_112px] gap-4 py-4 sm:grid-cols-[minmax(0,1fr)_150px] lg:flex lg:flex-col lg:gap-2 lg:py-5 lg:first:pt-0"
          >
            <div className="min-w-0 lg:contents">
              <span className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-red-600 lg:mb-0 lg:text-[11px]">
                {item.category}
              </span>

              <h3 className={`line-clamp-3 text-[15px] leading-[1.3] font-bold transition-colors group-hover:text-red-600 lg:text-[16px] ${dark ? "text-white" : "text-zinc-900"}`}>
                {item.title}
              </h3>

              <span className={`mt-2 flex items-center gap-1 text-[10px] lg:order-last lg:mt-1 lg:text-[11px] ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                <Clock3 size={11} /> {timeAgo(item.created_at)}
              </span>
            </div>

            {item.image_url && (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm lg:mt-1 lg:aspect-video lg:rounded-none">
                <img
                  src={item.image_url}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
