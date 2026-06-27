"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { Clock3, TrendingUp } from "lucide-react";

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

// ─── ticker financeiro inline ─────────────────────────────
const TICKERS = [
  { label: "IBOV ▲ 128.420", change: "+1,22%", up: true },
  { label: "DÓLAR ▼ R$5,42", change: "-0,32%", up: false },
  { label: "NASDAQ ▲", change: "+0,88%", up: true },
  { label: "BITCOIN ▲ US$108.220", change: "+2,10%", up: true },
  { label: "PETR4 ▼", change: "-1,04%", up: false },
  { label: "VALE3 ▲", change: "+2,18%", up: true },
  { label: "ETHEREUM ▲ US$4.180", change: "+3,42%", up: true },
  { label: "SELIC", change: "10,50% a.a.", up: true },
  { label: "S&P 500 ▲", change: "+0,61%", up: true },
  { label: "OURO ▲ US$2.380", change: "+0,44%", up: true },
];

function MarketTicker() {
  return (
    <div className="bg-white border border-zinc-200 overflow-hidden mb-8">
      <div className="overflow-hidden whitespace-nowrap">
        <div
          className="flex gap-12 py-3 px-4 text-[12px] font-semibold"
          style={{ animation: "marquee 28s linear infinite" }}
        >
          {[...TICKERS, ...TICKERS].map((item, i) => (
            <span key={i} className="shrink-0">
              <span className="text-zinc-500">{item.label} </span>
              <span className={item.up ? "text-green-600" : "text-red-500"}>
                {item.change}
              </span>
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
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
export default function MercadoClient({
  initialArticles,
}: {
  initialArticles?: Article[];
}) {
  const provided = Array.isArray(initialArticles);
  const [articles, setArticles] = useState<Article[]>(initialArticles ?? []);
  const [loading, setLoading] = useState(!provided);

  useEffect(() => {
    if (provided) return;
    async function load() {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "publicado")
        .ilike("category", "%Mercado%")
        .order("created_at", { ascending: false })
        .limit(20);

      setArticles(data || []);
      setLoading(false);
    }
    load();
  }, [provided]);

  // ── LOADING ──
  if (loading) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen text-black">
        <main className="max-w-[1400px] mx-auto px-4 md:px-5 py-8 md:py-12">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="w-full h-10 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <Skeleton className="w-full h-[340px] md:h-[480px]" />
            </div>
            <div className="lg:col-span-4 space-y-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-[110px] h-[80px] shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
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
        <main className="max-w-[1400px] mx-auto px-4 md:px-5 py-20 text-center">
          <TrendingUp size={40} className="mx-auto text-zinc-300 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-400">
            Nenhuma matéria de Mercado publicada ainda.
          </h2>
        </main>
      </div>
    );
  }

  const hero = articles[0];
  const secondary = articles.slice(1, 5);
  const grid = articles.slice(5, 11);
  const list = articles.slice(11, 20);

  return (
    <div className="bg-[#f5f5f5] min-h-screen text-black">

      <main className="max-w-[1400px] mx-auto px-4 md:px-5 py-8 md:py-12">

        {/* ── CABEÇALHO DA CATEGORIA ── */}
        <div className="flex items-center gap-3 mb-7 md:mb-9">
          <TrendingUp size={22} className="text-red-600" strokeWidth={2.5} />
          <h1 className="text-[26px] md:text-[32px] font-black tracking-tight text-black">
            Mercado
          </h1>
          <div className="flex-1 h-px bg-zinc-300 ml-2" />
        </div>

        {/* ── TICKER ── */}
        <MarketTicker />

        {/* ── HERO + LATERAL ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 mb-12">
          <div className="lg:col-span-8">
            <HeroCard article={hero} />
          </div>
          <div className="lg:col-span-4 bg-white border border-zinc-200 p-5 md:p-6 mt-4 lg:mt-0 space-y-5">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-3">
              Mais lidas em Mercado
            </h2>
            {secondary.map((a) => (
              <SecondaryCard key={a.id} article={a} />
            ))}
          </div>
        </div>

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

            {/* sidebar */}
            <aside className="lg:col-span-4">
              <div className="bg-white border border-zinc-200 p-6 md:p-8 sticky top-36">
                <span className="text-red-600 text-[10px] font-black uppercase tracking-widest block mb-3">
                  Newsletter
                </span>
                <h3 className="text-[22px] font-black text-black leading-tight">
                  Mercado no seu e-mail
                </h3>
                <p className="text-zinc-500 text-sm mt-3 leading-relaxed">
                  Bolsa, câmbio, fundos e economia global — análises toda manhã antes do pregão.
                </p>
                <input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  className="w-full mt-5 border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black transition"
                />
                <button className="w-full bg-black text-white py-3 mt-3 text-sm font-bold hover:opacity-80 transition">
                  Assinar
                </button>

                {/* tags */}
                <div className="mt-7 pt-6 border-t border-zinc-200">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-3">
                    Tópicos em Mercado
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Bolsa",
                      "Dólar",
                      "Selic",
                      "FII",
                      "Ações",
                      "Criptomoedas",
                      "Economia",
                      "Investimentos",
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
        {" · "}Cobertura completa de Mercado Financeiro
      </div>

    </div>
  );
}