"use client";

import Link from "next/link";

interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
}

interface TickerProps {
  dark: boolean;
  articles: Article[];
}

export function Ticker({ dark, articles }: TickerProps) {
  if (articles.length === 0) return null;
  return (
    <div className={`border-b overflow-hidden ${dark ? "bg-[#111] border-zinc-800" : "bg-zinc-900 border-zinc-900"}`}>
      <div className="overflow-hidden whitespace-nowrap">
        <div
          className="flex gap-14 py-3 text-[12px] font-medium text-white"
          style={{ animation: "marquee 38s linear infinite" }}
        >
          {[...articles, ...articles].map((item, i) => (
            <Link
              href={`/noticia/${item.slug}`}
              key={`${item.id}-${i}`}
              className="flex items-center gap-3 shrink-0 hover:text-red-400 transition-colors"
            >
              <span className="text-red-500 font-bold text-[10px] uppercase tracking-wider">{item.category}</span>
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
