"use client";

import Link from "next/link";
import { Clock3 } from "lucide-react";
import { timeAgo } from "@/lib/timeAgo";

interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  image_url?: string;
  created_at?: string;
}

interface ArticleGridProps {
  dark: boolean;
  articles: Article[];
}

export function ArticleGrid({ dark, articles }: ArticleGridProps) {
  if (articles.length === 0) return null;
  return (
    <>
      <div className={`flex items-center gap-3 pt-8 pb-6 border-b ${dark ? "border-zinc-800" : "border-zinc-200"}`}>
        <span className="w-1 h-5 bg-red-600 block shrink-0" />
        <h2 className={`text-[13px] font-black uppercase tracking-widest ${dark ? "text-zinc-300" : "text-zinc-800"}`}>Últimas notícias</h2>
        <div className={`flex-1 h-px ${dark ? "bg-zinc-800" : "bg-zinc-200"}`} />
      </div>
      <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 border-b pb-8 ${dark ? "border-zinc-800" : "border-zinc-200"}`}>
        {articles.map((item, i) => (
          <Link
            href={`/noticia/${item.slug}`}
            key={item.id}
            className={`group flex flex-col gap-3 pt-5 pb-6 px-4 ${
              i > 0 ? `border-l ${dark ? "border-zinc-800" : "border-zinc-200"}` : "pl-0"
            } ${i === articles.length - 1 ? "pr-0" : ""}`}
          >
            {item.image_url && (
              <div className="relative w-full overflow-hidden mb-1" style={{ aspectRatio: "4/3" }}>
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            )}
            <span className="text-red-600 text-[10px] md:text-[11px] font-black uppercase tracking-widest">{item.category}</span>
            <h3 className={`text-[13px] md:text-[15px] leading-[1.3] font-bold group-hover:text-red-600 transition-colors ${dark ? "text-white" : "text-zinc-900"}`}>
              {item.title}
            </h3>
            <span className={`text-[10px] md:text-[11px] flex items-center gap-1 mt-auto ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
              <Clock3 size={10} /> {timeAgo(item.created_at)}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
