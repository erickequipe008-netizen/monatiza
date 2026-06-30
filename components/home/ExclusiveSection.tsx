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

// Faixa "Exclusivo" na home pública — bloco escuro/tech que conecta o portal à
// área de assinantes (MonatizaPlus). Mostra matérias premium (prévia + paywall).
export function ExclusiveSection({ articles }: { dark?: boolean; articles: Article[] }) {
  const premium = articles.filter((a) => a.is_premium).slice(0, 4);
  if (premium.length === 0) return null;

  return (
    <section className="my-12 md:my-16">
      <div className="mx-auto max-w-[1280px] px-4">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0f] p-6 text-white md:p-10">
          <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#7C3AED]/25 blur-[100px]" />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#FF2D87]/20 blur-[100px]" />

          <div className="relative mb-7 flex items-end justify-between gap-4">
            <div>
              <span className="pro-gradient-text inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.25em]">
                <Crown size={15} /> Exclusivo
              </span>
              <h2 className="mt-2 text-[22px] font-black tracking-tight md:text-[28px]">Conteúdo só para assinantes</h2>
            </div>
            <Link
              href="/assinantes"
              className="pro-gradient inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-white transition hover:opacity-90"
            >
              Assine e leia tudo <ArrowRight size={14} />
            </Link>
          </div>

          <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {premium.map((a) => (
              <Link key={a.id} href={`/noticia/${a.slug}`} className="group block">
                <div className="relative w-full overflow-hidden rounded-2xl ring-1 ring-white/10" style={{ aspectRatio: "16/10" }}>
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
                <h3 className="mt-1 text-[16px] font-bold leading-snug text-zinc-100 transition group-hover:text-white">{a.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
