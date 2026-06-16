"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase/client";
import { Clock3, Briefcase } from "lucide-react";

// ─── tipos ────────────────────────────────────────────────
interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image_url: string;
  category: string;
  created_at: string;
  journalist_name?: string;
  author?: string;
}

// ─── helpers ──────────────────────────────────────────────
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Agora mesmo";
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d}d atrás`;
}

// ─── skeleton ─────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-zinc-200 animate-pulse rounded ${className ?? ""}`} />
  );
}

// ─── card hero ────────────────────────────────────────────
function HeroCard({ article }: { article: Article }) {
  return (
    <Link href={`/noticia/${article.slug}`} className="group block">
      <div className="relative w-full h-[340px] md:h-[480px] overflow-hidden">
        <Image
          src={article.image_url}
          alt={article.title}
          fill
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <span className="text-red-500 font-bold uppercase text-[11px] tracking-widest mb-3 block">
            {article.category}
          </span>
          <h2 className="text-white text-[22px] md:text-[38px] font-black leading-[1.1] tracking-tight max-w-3xl">
            {article.title}
          </h2>
          <p className="text-zinc-300 text-[14px] md:text-[16px] mt-3 max-w-2xl leading-relaxed line-clamp-2 hidden md:block">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-3 mt-4 text-zinc-400 text-xs">
            <Clock3 size={13} />
            <span>{timeAgo(article.created_at)}</span>
            <span className="text-zinc-600">·</span>
            <span>
              {article.journalist_name || article.author || "Redação Monatiza"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── card destaque secundário (maior, ao lado do hero) ────
function FeatureCard({ article }: { article: Article }) {
  return (
    <Link href={`/noticia/${article.slug}`} className="group block">
      <div className="relative w-full h-[155px] md:h-[225px] overflow-hidden">
        <Image
          src={article.image_url}
          alt={article.title}
          fill
          className="object-cover transition duration-700 group-hover:scale-[1.04]"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
          <span className="text-red-500 font-bold uppercase text-[10px] tracking-widest mb-1 block">
            {article.category}
          </span>
          <h3 className="text-white text-[15px] md:text-[19px] font-black leading-tight tracking-tight">
            {article.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}

// ─── card de grid ─────────────────────────────────────────
function GridCard({ article }: { article: Article }) {
  return (
    <Link href={`/noticia/${article.slug}`} className="group block">
      <div className="relative w-full h-[200px] md:h-[220px] overflow-hidden rounded">
        <Image
          src={article.image_url}
          alt={article.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
          unoptimized
        />
      </div>
      <div className="mt-4">
        <span className="text-red-600 font-bold uppercase text-[10px] tracking-wider">
          {article.category}
        </span>
        <h3 className="text-[16px] md:text-[18px] font-bold text-black leading-snug mt-2 group-hover:text-red-600 transition">
          {article.title}
        </h3>
        <p className="text-zinc-500 text-[13px] mt-2 leading-relaxed line-clamp-2">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-2 mt-3 text-zinc-400 text-xs">
          <Clock3 size={12} />
          <span>{timeAgo(article.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── card lateral compacto ────────────────────────────────
function SecondaryCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/noticia/${article.slug}`}
      className="group flex gap-4 border-b border-zinc-200 pb-5 last:border-0 last:pb-0"
    >
      <div className="relative w-[90px] md:w-[110px] h-[68px] md:h-[80px] shrink-0 overflow-hidden rounded">
        <Image
          src={article.image_url}
          alt={article.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          unoptimized
        />
      </div>
      <div className="flex flex-col justify-between">
        <div>
          <span className="text-red-600 font-bold uppercase text-[10px] tracking-wider">
            {article.category}
          </span>
          <h3 className="text-[14px] md:text-[15px] font-bold text-black leading-snug mt-1 group-hover:text-red-600 transition line-clamp-2">
            {article.title}
          </h3>
        </div>
        <span className="text-zinc-400 text-xs">{timeAgo(article.created_at)}</span>
      </div>
    </Link>
  );
}

// ─── card lista numerada ──────────────────────────────────
function ListCard({ article, index }: { article: Article; index: number }) {
  return (
    <Link
      href={`/noticia/${article.slug}`}
      className="group flex gap-5 border-b border-zinc-200 pb-6 last:border-0"
    >
      <span className="text-[28px] font-black text-zinc-200 leading-none w-8 shrink-0 select-none">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-red-600 font-bold uppercase text-[10px] tracking-wider">
          {article.category}
        </span>
        <h3 className="text-[15px] md:text-[17px] font-bold text-black leading-snug mt-1 group-hover:text-red-600 transition">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-zinc-400 text-xs">
          <Clock3 size={12} />
          <span>{timeAgo(article.created_at)}</span>
        </div>
      </div>
      <div className="relative w-[100px] md:w-[130px] h-[72px] md:h-[90px] shrink-0 overflow-hidden rounded">
        <Image
          src={article.image_url}
          alt={article.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          unoptimized
        />
      </div>
    </Link>
  );
}

// ─── página principal ─────────────────────────────────────
export default function NegociosPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .ilike("category", "%Negócios%")
        .order("created_at", { ascending: false })
        .limit(20);

      setArticles(data || []);
      setLoading(false);
    }
    load();
  }, []);

  // ── LOADING ──
  if (loading) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen text-black">
        <Header />
        <main className="max-w-[1400px] mx-auto px-4 md:px-5 py-8 md:py-12">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <Skeleton className="w-full h-[340px] md:h-[480px]" />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <Skeleton className="w-full h-[155px] md:h-[225px]" />
              <Skeleton className="w-full h-[155px] md:h-[225px]" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── EMPTY ──
  if (articles.length === 0) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen text-black">
        <Header />
        <main className="max-w-[1400px] mx-auto px-4 md:px-5 py-20 text-center">
          <Briefcase size={40} className="mx-auto text-zinc-300 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-400">
            Nenhuma matéria de Negócios publicada ainda.
          </h2>
        </main>
      </div>
    );
  }

  const hero = articles[0];
  const features = articles.slice(1, 3);
  const secondary = articles.slice(3, 7);
  const grid = articles.slice(7, 13);
  const list = articles.slice(13, 20);

  return (
    <div className="bg-[#f5f5f5] min-h-screen text-black">
      <Header />

      <main className="max-w-[1400px] mx-auto px-4 md:px-5 py-8 md:py-12">

        {/* ── CABEÇALHO DA CATEGORIA ── */}
        <div className="flex items-center gap-3 mb-7 md:mb-9">
          <Briefcase size={22} className="text-red-600" strokeWidth={2.5} />
          <h1 className="text-[26px] md:text-[32px] font-black tracking-tight text-black">
            Negócios
          </h1>
          <div className="flex-1 h-px bg-zinc-300 ml-2" />
        </div>

        {/* ── HERO + 2 DESTAQUES VERTICAIS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mb-12">
          <div className="lg:col-span-8">
            <HeroCard article={hero} />
          </div>
          <div className="lg:col-span-4 grid grid-cols-1 gap-4">
            {features.map((a) => (
              <FeatureCard key={a.id} article={a} />
            ))}
          </div>
        </div>

        {/* ── MAIS LIDAS (faixa horizontal) ── */}
        {secondary.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                Mais lidas em Negócios
              </span>
              <div className="flex-1 h-px bg-zinc-300" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 bg-white border border-zinc-200 p-5 md:p-6">
              {secondary.map((a) => (
                <SecondaryCard key={a.id} article={a} />
              ))}
            </div>
          </>
        )}

        {/* ── GRID ── */}
        {grid.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-7">
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                Últimas notícias
              </span>
              <div className="flex-1 h-px bg-zinc-300" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
              {grid.map((a) => (
                <GridCard key={a.id} article={a} />
              ))}
            </div>
          </>
        )}

        {/* ── LISTA + SIDEBAR ── */}
        {list.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  Continue lendo
                </span>
                <div className="flex-1 h-px bg-zinc-300" />
              </div>
              {list.map((a, i) => (
                <ListCard key={a.id} article={a} index={i} />
              ))}
            </div>

            <aside className="lg:col-span-4">
              <div className="bg-white border border-zinc-200 p-6 md:p-8 sticky top-36">
                <span className="text-red-600 text-[10px] font-black uppercase tracking-widest block mb-3">
                  Newsletter
                </span>
                <h3 className="text-[22px] font-black text-black leading-tight">
                  Negócios no seu e-mail
                </h3>
                <p className="text-zinc-500 text-sm mt-3 leading-relaxed">
                  Empresas, startups e estratégia — os movimentos que importam, direto na caixa de entrada.
                </p>
                <input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  className="w-full mt-5 border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black transition"
                />
                <button className="w-full bg-black text-white py-3 mt-3 text-sm font-bold hover:opacity-80 transition">
                  Assinar
                </button>

                <div className="mt-7 pt-6 border-t border-zinc-200">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">
                    Tópicos em Negócios
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Startups",
                      "Empreendedorismo",
                      "Fusões",
                      "M&A",
                      "Liderança",
                      "Varejo",
                      "Indústria",
                      "Estratégia",
                    ].map((tag) => (
                      <span
                        key={tag}
                        className="border border-zinc-300 text-zinc-600 text-[11px] font-semibold px-3 py-1 hover:border-black hover:text-black transition cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

      </main>

      {/* ── RODAPÉ DA CATEGORIA ── */}
      <div className="border-t border-zinc-300 mt-16 py-8 text-center text-xs text-zinc-400">
        <Link href="/" className="hover:text-black transition font-bold">
          monatiza
        </Link>
        {" · "}Cobertura completa de Negócios
      </div>

    </div>
  );
}