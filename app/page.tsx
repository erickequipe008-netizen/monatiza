"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, X, Clock3, ChevronDown } from "lucide-react";
import { supabase } from "@/services/supabase";


// ─── DADOS DO MEGA MENU ────────────────────────────────────────────────
const EDITORIAS = [
  { label: "Monatiza Negócios", sub: true },
  { label: "Monatiza Carreira", sub: true },
  { label: "Monatiza ESG" },
  { label: "Monatiza Geral" },
  { label: "Monatiza Life" },
  { label: "Monatiza MKT" },
  { label: "Monatiza Dinheiro", sub: true },
  { label: "Monatiza Motors" },
  { label: "Monatiza Mulher", sub: true },
  { label: "Monatiza Real Estate" },
];

const INSIDE = [
  "Publicidade",
  "Infomercial",
  "Monatiza Cast",
  "Collab",
  "Colunas",
  "Eventos",
  "Newsletter",
  "Revista Digital",
  "Assine",
  "Anuncie",
  "Monatiza Store",
];

const LISTAS = [
  { label: "Top 100", sub: true },
  { label: "Bilionários Brasileiros", sub: true },
  { label: "Bilionários do Mundo", sub: true },
  { label: "Melhores Empresas do Brasil" },
  { label: "Monatiza 50+", sub: true },
  { label: "Heart Billions" },
  { label: "Melhores CEOs do Brasil", sub: true },
];

const NAV_EDITORIAS = [
  "Negócios",
  "Carreira",
  "Dinheiro",
  "Tecnologia",
  "ESG",
  "Life",
  "MKT",
  "Motors",
  "Mulher",
  "Real Estate",
  "Listas",
  "Podcast",
];

// ─── helpers ──────────────────────────────────────────────
function timeAgo(dateStr?: string) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Agora mesmo";
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d}d atrás`;
}

function Skeleton({ className, dark }: { className?: string; dark: boolean }) {
  return (
    <div
      className={`animate-pulse rounded ${
        dark ? "bg-zinc-800" : "bg-zinc-200"
      } ${className ?? ""}`}
    />
  );
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadArticles() {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setArticles(data);
      setLoading(false);
    }
    loadArticles();
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const featured = articles.find((item) => item.image_url);
  const sideArticles = articles.filter((item) => item.id !== featured?.id).slice(0, 3);
  const secondaryArticles = articles.filter((item) => item.id !== featured?.id).slice(3, 6);
  const gridArticles = articles.filter((item) => item.id !== featured?.id).slice(6, 12);
  const tickerArticles = articles.slice(0, 8);

  const dark = darkMode;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/busca?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>

      <main
        className={`transition-colors duration-300 ${
          dark ? "bg-[#0d0d0d] text-white" : "bg-white text-black"
        }`}
      >
        {/* ── MEGA MENU ── */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
            <aside className="relative z-10 w-full max-w-[860px] h-full bg-[#111] text-white overflow-y-auto flex flex-col">
              <div className="flex items-center justify-between px-10 py-7 border-b border-zinc-800">
                <Link href="/" onClick={() => setMenuOpen(false)}>
                  <span className="text-[28px] font-serif font-black tracking-tight">monatiza</span>
                </Link>
                <button aria-label="Fechar menu" onClick={() => setMenuOpen(false)} className="hover:opacity-60 transition p-1">
                  <X size={26} />
                </button>
              </div>
              <div className="px-10 py-6 border-b border-zinc-800">
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Digite sua pesquisa"
                    className="flex-1 h-[54px] px-5 bg-transparent border border-zinc-700 outline-none text-[15px] placeholder:text-zinc-500 text-white"
                  />
                  <button type="submit" className="h-[54px] px-7 bg-white text-black font-semibold text-[14px] hover:bg-zinc-200 transition-all">
                    Buscar
                  </button>
                </form>
              </div>
              <div className="px-10 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1.1fr_0.8fr] gap-10 flex-1">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-6">Editorias Monatiza</h4>
                  <ul className="flex flex-col gap-4">
                    {EDITORIAS.map((item) => (
                      <li key={item.label} className="flex items-center justify-between group">
                        <button onClick={() => setMenuOpen(false)} className="text-[14px] font-medium text-left hover:text-red-500 transition-colors">
                          {item.label}
                        </button>
                        {item.sub && <span className="text-zinc-600 group-hover:text-red-500 transition-colors text-[16px]">+</span>}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-6">Inside</h4>
                  <ul className="flex flex-col gap-4">
                    {INSIDE.map((item) => (
                      <li key={item}>
                        <button onClick={() => setMenuOpen(false)} className="text-[14px] font-medium text-left hover:text-red-500 transition-colors">
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-6">Monatiza Listas</h4>
                  <ul className="flex flex-col gap-4">
                    {LISTAS.map((item) => (
                      <li key={item.label} className="flex items-center justify-between group">
                        <button onClick={() => setMenuOpen(false)} className="text-[14px] font-medium text-left hover:text-red-500 transition-colors">
                          {item.label}
                        </button>
                        {item.sub && <span className="text-zinc-600 group-hover:text-red-500 transition-colors text-[16px]">+</span>}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-6">
                  <div className="bg-red-600 p-5">
                    <p className="text-[15px] font-bold leading-[1.3] mb-3">Assine a Newsletter Monatiza. Inspire-se, lidere, conquiste.</p>
                    <button onClick={() => { setMenuOpen(false); setLoginOpen(true); }} className="text-[12px] font-bold uppercase tracking-wider underline hover:no-underline transition">
                      Assinar agora →
                    </button>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Redes Sociais</h4>
                    <div className="flex flex-wrap gap-4">
                      {["Instagram", "X", "YouTube", "LinkedIn", "Facebook"].map((rede) => (
                        <button key={rede} className="text-[13px] font-medium text-zinc-300 hover:text-white transition">{rede}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ── MODAL ASSINAR ── */}
        {loginOpen && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-5">
            <div className={`w-full max-w-[460px] p-8 ${dark ? "bg-[#111] text-white" : "bg-white text-black"}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[34px] font-serif font-bold">MONATIZA Assinar</h2>
                <button aria-label="Fechar" onClick={() => setLoginOpen(false)} className="hover:opacity-60 transition"><X size={22} /></button>
              </div>
              <p className="text-[15px] leading-7 text-zinc-500 mb-7">Receba análises exclusivas, tendências do mercado, tecnologia, negócios, inteligência artificial e conteúdos reservados para assinantes.</p>
              <div className="space-y-4">
                <input type="email" placeholder="Digite seu e-mail" className={`w-full h-[54px] border px-5 bg-transparent outline-none mb-4 ${dark ? "border-zinc-700 placeholder:text-zinc-500 text-white" : "border-zinc-300"}`} />
                <input type="password" placeholder="Sua senha" className={`w-full h-[54px] px-5 border bg-transparent outline-none ${dark ? "border-zinc-700 placeholder:text-zinc-500 text-white" : "border-zinc-300"}`} />
                <button className="w-full h-[54px] bg-red-600 text-white font-semibold hover:bg-red-700 transition-all">Entrar na área exclusiva</button>
                <button className={`w-full h-[54px] border font-semibold hover:opacity-70 transition ${dark ? "border-zinc-600" : "border-zinc-300"}`}>Criar nova conta</button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL PESQUISA ── */}
        {searchOpen && (
          <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-start pt-28 px-5">
            <div className="w-full max-w-[720px]">
              <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { window.location.href = `/busca?q=${encodeURIComponent(searchQuery.trim())}`; }}}>
                <div className="flex items-center gap-0">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="O que você está procurando?"
                    className="flex-1 h-[64px] px-6 bg-[#111] border border-zinc-700 outline-none text-[18px] text-white placeholder:text-zinc-500"
                  />
                  <button type="submit" className="h-[64px] px-8 bg-red-600 text-white font-bold text-[15px] hover:bg-red-700 transition-all">Buscar</button>
                </div>
              </form>
              <button onClick={() => setSearchOpen(false)} className="mt-5 text-zinc-400 text-[13px] hover:text-white transition flex items-center gap-2">
                <X size={14} /> Fechar pesquisa
              </button>
            </div>
          </div>
        )}

        <style>{`
          @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes fadeUp {
            0%   { opacity: 0; transform: translateY(14px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .fade-up { animation: fadeUp 0.5s ease forwards; }
          .nav-item { position: relative; }
          .nav-item:hover .nav-underline { width: 100%; }
          .nav-underline { display: block; height: 2px; background: #dc2626; width: 0; transition: width 0.2s ease; position: absolute; bottom: -2px; left: 0; }
        `}</style>

        {/* ── BARRA DE EDITORIAS ESTILO FOLHA ── */}
        <div className={`border-b sticky top-0 z-40 ${dark ? "bg-[#0d0d0d] border-zinc-800" : "bg-white border-zinc-200"}`}>
          <div className="max-w-[1280px] mx-auto px-4 flex items-center gap-0 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setMenuOpen(true)}
              className={`flex items-center gap-1.5 shrink-0 h-[46px] px-4 text-[13px] font-bold uppercase tracking-wider border-r ${dark ? "border-zinc-800 hover:bg-zinc-900" : "border-zinc-200 hover:bg-zinc-50"} transition`}
            >
              <Menu size={16} />
              <span className="hidden sm:inline">Todas</span>
            </button>
            {NAV_EDITORIAS.map((ed) => (
              <button
                key={ed}
                className={`nav-item shrink-0 h-[46px] px-4 text-[13px] font-semibold hover:text-red-600 transition-colors whitespace-nowrap ${dark ? "text-zinc-300" : "text-zinc-700"}`}
              >
                {ed}
                <span className="nav-underline" />
              </button>
            ))}
            <div className="ml-auto shrink-0 pl-2">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Buscar"
                className={`h-[46px] px-4 hover:text-red-600 transition-colors ${dark ? "text-zinc-400" : "text-zinc-500"}`}
              >
                <Search size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* ── LOADING ── */}
        {loading && (
          <section className="max-w-[1280px] mx-auto px-4 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 border-b pb-10 mb-10">
              <div>
                <Skeleton dark={dark} className="h-3 w-20 mb-4" />
                <Skeleton dark={dark} className="h-10 w-full mb-2" />
                <Skeleton dark={dark} className="h-10 w-3/4 mb-6" />
                <Skeleton dark={dark} className="w-full h-[360px]" />
              </div>
              <div className="space-y-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2 pb-5 border-b">
                    <Skeleton dark={dark} className="h-3 w-16" />
                    <Skeleton dark={dark} className="h-4 w-full" />
                    <Skeleton dark={dark} className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── HERO PRINCIPAL — layout Folha ── */}
        {!loading && featured && (
          <section className="max-w-[1280px] mx-auto px-4 pt-6 pb-0 fade-up">

            {/* BLOCO TOPO: manchete + laterais */}
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
                  <h1 className={`text-[28px] sm:text-[36px] md:text-[44px] leading-[1.08] font-serif font-black tracking-tight mb-4 group-hover:text-red-600 transition-colors`}>
                    {featured.title}
                  </h1>
                </Link>

                <p className={`text-[15px] leading-relaxed mb-5 max-w-[600px] ${dark ? "text-zinc-400" : "text-zinc-600"}`}>
                  {featured.excerpt}
                </p>

                <Link href={`/noticia/${featured.slug}`}>
                  <div className="relative w-full h-[220px] md:h-[380px] overflow-hidden group">
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

              {/* COLUNA LATERAL: notícias secundárias */}
              <div className="pl-0 lg:pl-7 pt-6 lg:pt-0 flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
                {sideArticles.map((item) => (
                  <Link
                    href={`/noticia/${item.slug}`}
                    key={item.id}
                    className="group flex flex-col gap-2 py-5 first:pt-0"
                  >
                    <span className="text-red-600 text-[11px] font-black uppercase tracking-widest">{item.category}</span>
                    <h3 className={`text-[16px] leading-[1.3] font-bold group-hover:text-red-600 transition-colors ${dark ? "text-white" : "text-zinc-900"}`}>
                      {item.title}
                    </h3>
                    {item.image_url && (
                      <div className="relative w-full h-[110px] overflow-hidden mt-1">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <span className={`text-[11px] flex items-center gap-1 mt-1 ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                      <Clock3 size={11} /> {timeAgo(item.created_at)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── TICKER ── */}
            {tickerArticles.length > 0 && (
              <div className={`border-b overflow-hidden ${dark ? "bg-[#111] border-zinc-800" : "bg-zinc-900 border-zinc-900"}`}>
                <div className="overflow-hidden whitespace-nowrap">
                  <div
                    className="flex gap-14 py-3 text-[12px] font-medium text-white"
                    style={{ animation: "marquee 38s linear infinite" }}
                  >
                    {[...tickerArticles, ...tickerArticles].map((item, i) => (
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
            )}

            {/* ── BLOCO SECUNDÁRIO: 3 colunas ── */}
            {secondaryArticles.length > 0 && (
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x border-b ${dark ? "divide-zinc-800 border-zinc-800" : "divide-zinc-200 border-zinc-200"}`}>
                {secondaryArticles.map((item) => (
                  <Link
                    href={`/noticia/${item.slug}`}
                    key={item.id}
                    className="group flex flex-col gap-3 p-5 first:pl-0 last:pr-0"
                  >
                    <span className="text-red-600 text-[11px] font-black uppercase tracking-widest">{item.category}</span>
                    <h3 className={`text-[17px] leading-[1.3] font-bold group-hover:text-red-600 transition-colors ${dark ? "text-white" : "text-zinc-900"}`}>
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className={`text-[13px] leading-relaxed line-clamp-2 ${dark ? "text-zinc-400" : "text-zinc-500"}`}>{item.excerpt}</p>
                    )}
                    {item.image_url && (
                      <div className="relative w-full h-[140px] overflow-hidden mt-auto">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {/* ── LABEL SEÇÃO ── */}
            <div className={`flex items-center gap-3 pt-8 pb-6 border-b ${dark ? "border-zinc-800" : "border-zinc-200"}`}>
              <span className="w-1 h-5 bg-red-600 block shrink-0" />
              <h2 className={`text-[13px] font-black uppercase tracking-widest ${dark ? "text-zinc-300" : "text-zinc-800"}`}>Últimas notícias</h2>
              <div className={`flex-1 h-px ${dark ? "bg-zinc-800" : "bg-zinc-200"}`} />
            </div>

            {/* ── GRID 4 COLUNAS ── */}
            {gridArticles.length > 0 && (
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 border-b pb-8 ${dark ? "border-zinc-800" : "border-zinc-200"}`}>
                {gridArticles.map((item, i) => (
                  <Link
                    href={`/noticia/${item.slug}`}
                    key={item.id}
                    className={`group flex flex-col gap-3 pt-5 pb-6 px-5 ${
                      i > 0 ? `border-l ${dark ? "border-zinc-800" : "border-zinc-200"}` : "pl-0"
                    } ${i === gridArticles.length - 1 ? "pr-0" : ""}`}
                  >
                    {item.image_url && (
                      <div className="relative w-full h-[120px] overflow-hidden mb-1">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <span className="text-red-600 text-[11px] font-black uppercase tracking-widest">{item.category}</span>
                    <h3 className={`text-[15px] leading-[1.3] font-bold group-hover:text-red-600 transition-colors ${dark ? "text-white" : "text-zinc-900"}`}>
                      {item.title}
                    </h3>
                    <span className={`text-[11px] flex items-center gap-1 mt-auto ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                      <Clock3 size={11} /> {timeAgo(item.created_at)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── NEWSLETTER BANNER ── */}
        {!loading && (
          <section className={`border-t ${dark ? "border-zinc-800 bg-[#111]" : "border-zinc-200 bg-[#f7f7f7]"}`}>
            <div className="max-w-[1280px] mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-red-600 text-[11px] font-black uppercase tracking-widest block mb-1">Newsletter</span>
                <h3 className={`text-[22px] font-serif font-bold ${dark ? "text-white" : "text-zinc-900"}`}>O futuro dos negócios, direto no seu e-mail</h3>
                <p className={`text-[14px] mt-1 ${dark ? "text-zinc-400" : "text-zinc-500"}`}>Inovação, IA e mercado — curadoria semanal sem ruído.</p>
              </div>
              <div className="flex items-center gap-0 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Digite seu e-mail"
                  className={`h-[50px] px-5 text-[14px] outline-none border bg-transparent w-full md:w-[280px] ${dark ? "border-zinc-700 placeholder:text-zinc-500 text-white" : "border-zinc-300 text-zinc-900"}`}
                />
                <button className="h-[50px] px-7 bg-red-600 text-white font-semibold text-[14px] hover:bg-red-700 transition-colors shrink-0">
                  Assinar
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── FAIXA INSTITUCIONAL ── */}
        {!loading && (
          <section className={`border-t ${dark ? "border-zinc-800" : "border-zinc-200"}`}>
            <div className={`max-w-[1280px] mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x ${dark ? "divide-zinc-800" : "divide-zinc-200"}`}>
              {[
                { label: "Nosso compromisso", title: "Inovação como editoria principal", desc: "Cobrimos o que está reescrevendo o mercado — IA, tecnologia e os negócios que vêm a seguir." },
                { label: "Curadoria", title: "Relevância acima de volume", desc: "Cada matéria publicada passa por critério editorial — sem ruído, sem clickbait." },
                { label: "Design premium", title: "Uma leitura à altura do conteúdo", desc: "Experiência editorial pensada para quem decide rápido e exige profundidade." },
              ].map((item, i) => (
                <div key={i} className={`py-6 ${i > 0 ? "md:pl-8" : ""} ${i < 2 ? "md:pr-8" : ""}`}>
                  <span className="text-red-600 text-[11px] font-black uppercase tracking-widest block mb-2">{item.label}</span>
                  <h3 className={`text-[18px] font-serif font-bold leading-tight mb-2 ${dark ? "text-white" : "text-zinc-900"}`}>{item.title}</h3>
                  <p className={`text-[13px] leading-relaxed ${dark ? "text-zinc-400" : "text-zinc-500"}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}