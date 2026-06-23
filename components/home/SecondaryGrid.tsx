"use client";

import Link from "next/link";

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  category: string;
  image_url?: string;
}

interface SecondaryGridProps {
  dark: boolean;
  articles: Article[];
}

export function SecondaryGrid({ dark, articles }: SecondaryGridProps) {
  if (articles.length === 0) return null;
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x border-b ${dark ? "divide-zinc-800 border-zinc-800" : "divide-zinc-200 border-zinc-200"}`}>
      {articles.map((item) => (
        <Link href={`/noticia/${item.slug}`} key={item.id} className="group flex flex-col gap-3 p-5 first:pl-0 last:pr-0">
          <span className="text-red-600 text-[11px] font-black uppercase tracking-widest">{item.category}</span>
          <h3 className={`text-[17px] leading-[1.3] font-bold group-hover:text-red-600 transition-colors ${dark ? "text-white" : "text-zinc-900"}`}>
            {item.title}
          </h3>
          {item.excerpt && (
            <p className={`text-[13px] leading-relaxed line-clamp-2 ${dark ? "text-zinc-400" : "text-zinc-500"}`}>{item.excerpt}</p>
          )}
          {item.image_url && (
            <div className="relative w-full overflow-hidden mt-auto" style={{ aspectRatio: "16/9" }}>
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
