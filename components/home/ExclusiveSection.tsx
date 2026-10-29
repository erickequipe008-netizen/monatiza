"use client";

import Link from "next/link";
import { Crown, ArrowRight } from "lucide-react";

type Article = {
  id: number | string;
  slug: string;
  title: string;
  category?: string;
  image_url?: string;
  is_premium?: boolean;
};

// Faixa "Exclusivo" na home — padrão jornalístico (sem caixa). Só o nome
// "Exclusivo" fica destacado em gradiente; matérias premium (prévia + paywall).
export function ExclusiveSection({ dark, articles }: { dark?: boolean; articles: Article[] }) {
  const premium = articles.filter((a) => a.is_premium).slice(0, 4);
  if (premium.length === 0) return null;

  return (
    <section className="mx-auto my-12 max-w-[1280px] px-4 md:my-16">
      <div className={`mb-7 flex items-end justify-between gap-4 border-t pt-5 ${dark ? "border-zinc-800" : "border-zinc-200"}`}>
        <div>
          <span className="pro-gradient-text inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.25em]">
            <Crown size={14} /> Exclusivo
          </span>
          <h2 className={`mt-1 font-serif text-[22px] font-black tracking-tight md:text-[28px] ${dark ? "text-white" : "text-black"}`}>
            Conteúdo só para assinantes
          </h2>
        </div>
        <Link
          href="/assinantes"
          className="pro-gradient-text flex shrink-0 items-center gap-1 text-[13px] font-bold transition hover:opacity-80"
        >
          Assine e leia tudo <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 md:gap-7">
        {premium.map((a) => (
          <Link key={a.id} href={`/noticia/${a.slug}`} className="group block">
            <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "16/10" }}>
              {a.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.image_url}
                  alt={a.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              )}
              <span className="pro-gradient absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                <Crown size={10} /> Premium
              </span>
            </div>
            <span className="pro-gradient-text mt-3 block text-[10px] font-black uppercase tracking-widest">{a.category}</span>
            <h3
              className={`mt-1 font-serif text-[17px] font-bold leading-snug transition group-hover:opacity-80 ${
                dark ? "text-white" : "text-black"
              }`}
            >
              {a.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
