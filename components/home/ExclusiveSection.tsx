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

// Faixa "Conteúdo Exclusivo" na home pública — discreta, padrão portal grande.
// Mostra matérias premium; ao clicar, o visitante vê a prévia + paywall.
export function ExclusiveSection({ dark, articles }: { dark?: boolean; articles: Article[] }) {
  const premium = articles.filter((a) => a.is_premium).slice(0, 4);
  if (premium.length === 0) return null;

  return (
    <section className="max-w-[1280px] mx-auto px-4 my-12 md:my-16">
      <div
        className={`flex items-end justify-between gap-4 border-t pt-5 mb-7 ${
          dark ? "border-zinc-800" : "border-zinc-200"
        }`}
      >
        <h2
          className={`flex items-center gap-2 font-serif text-[22px] md:text-[26px] font-black tracking-tight ${
            dark ? "text-white" : "text-black"
          }`}
        >
          <Crown size={18} className="text-[#E0263B]" /> Conteúdo Exclusivo
        </h2>
        <Link
          href="/assinantes"
          className="flex shrink-0 items-center gap-1 text-[13px] font-bold text-[#E0263B] hover:underline"
        >
          Assine e leia tudo <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7">
        {premium.map((a) => (
          <Link key={a.id} href={`/noticia/${a.slug}`} className="group block">
            <div className="relative w-full overflow-hidden rounded" style={{ aspectRatio: "16/10" }}>
              {a.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.image_url}
                  alt={a.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              )}
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded bg-black/85 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                <Crown size={10} className="text-[#E0263B]" /> Premium
              </span>
            </div>
            <span className="mt-3 block text-[10px] font-black uppercase tracking-widest text-[#E0263B]">
              {a.category}
            </span>
            <h3
              className={`mt-1 font-serif text-[17px] font-bold leading-snug transition group-hover:text-[#E0263B] ${
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
