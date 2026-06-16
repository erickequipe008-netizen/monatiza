"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, Moon, Sun, X, ArrowUpRight, Clock3 } from "lucide-react";
import { supabase } from "@/services/supabase";
import Header from "@/components/Header";

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

  // Focar no input quando pesquisa abre
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // Fechar menu/busca com ESC
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
  const gridArticles = articles.filter((item) => item.id !== featured?.id).slice(3, 9);
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

    <Header />

    <main
      className={`transition-colors duration-300 ${
        dark ? "bg-[#080808] text-white" : "bg-white text-black"
      }`}
      style={{
        margin: 0,
        padding: 0,
      }}
    >
      {/* ── MEGA MENU ESTILO FORBES ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />

          <aside className="relative z-10 w-full max-w-[860px] h-full bg-[#111] text-white overflow-y-auto flex flex-col">

            <div className="flex items-center justify-between px-10 py-7 border-b border-zinc-800">
              <Link href="/" onClick={() => setMenuOpen(false)}>
                <span className="text-[28px] font-serif font-black tracking-tight">monatiza</span>
              </Link>
              <button
                aria-label="Fechar menu"
                onClick={() => setMenuOpen(false)}
                className="hover:opacity-60 transition p-1"
              >
                <X size={26} />
              </button>
            </div>

            <div className="px-10 py-6 border-b border-zinc-800">
              <form onSubmit={handleSearch} className="flex items-center gap-0">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Digite sua pesquisa"
                  className="flex-1 h-[54px] px-5 bg-transparent border border-zinc-700 outline-none text-[15px] placeholder:text-zinc-500 text-white"
                />
                <button
                  type="submit"
                  className="h-[54px] px-7 bg-white text-black font-semibold text-[14px] hover:bg-zinc-200 transition-all"
                >
                  Buscar
                </button>
              </form>
            </div>

            <div className="px-10 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1.1fr_0.8fr] gap-10 flex-1">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-6">
                  Editorias Monatiza
                </h4>
                <ul className="flex flex-col gap-4">
                  {EDITORIAS.map((item) => (
                    <li key={item.label} className="flex items-center justify-between group">
                      <button
                        onClick={() => setMenuOpen(false)}
                        className="text-[14px] font-medium text-left hover:text-red-500 transition-colors"
                      >
                        {item.label}
                      </button>
                      {item.sub && (
                        <span className="text-zinc-600 group-hover:text-red-500 transition-colors text-[16px]">+</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-6">
                  Inside
                </h4>
                <ul className="flex flex-col gap-4">
                  {INSIDE.map((item) => (
                    <li key={item}>
                      <button
                        onClick={() => setMenuOpen(false)}
                        className="text-[14px] font-medium text-left hover:text-red-500 transition-colors"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-6">
                  Monatiza Listas
                </h4>
                <ul className="flex flex-col gap-4">
                  {LISTAS.map((item) => (
                    <li key={item.label} className="flex items-center justify-between group">
                      <button
                        onClick={() => setMenuOpen(false)}
                        className="text-[14px] font-medium text-left hover:text-red-500 transition-colors"
                      >
                        {item.label}
                      </button>
                      {item.sub && (
                        <span className="text-zinc-600 group-hover:text-red-500 transition-colors text-[16px]">+</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-6">
                <div className="bg-red-600 p-5">
                  <p className="text-[15px] font-bold leading-[1.3] mb-3">
                    Assine a Newsletter Monatiza. Inspire-se, lidere, conquiste.
                  </p>
                  <button
                    onClick={() => { setMenuOpen(false); setLoginOpen(true); }}
                    className="text-[12px] font-bold uppercase tracking-wider underline hover:no-underline transition"
                  >
                    Assinar agora →
                  </button>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
                    Redes Sociais
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {["Instagram", "X", "YouTube", "LinkedIn", "Facebook"].map((rede) => (
                      <button
                        key={rede}
                        className="text-[13px] font-medium text-zinc-300 hover:text-white transition"
                      >
                        {rede}
                      </button>
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
              <button aria-label="Fechar" onClick={() => setLoginOpen(false)} className="hover:opacity-60 transition">
                <X size={22} />
              </button>
            </div>
            <p className="text-[15px] leading-7 text-zinc-500 mb-7">
              Receba análises exclusivas, tendências do mercado, tecnologia, negócios,
              inteligência artificial e conteúdos reservados para assinantes.
            </p>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Digite seu e-mail"
                className={`w-full h-[54px] border px-5 bg-transparent outline-none mb-4
                  ${
                    dark
                      ? "border-zinc-700 placeholder:text-zinc-500 text-white"
                      : "border-zinc-300"
                  }`}
              />
              <input
                type="password"
                placeholder="Sua senha"
                className={`w-full h-[54px] px-5 border bg-transparent outline-none
                  ${dark ? "border-zinc-700 placeholder:text-zinc-500 text-white" : "border-zinc-300"}`}
              />
              <button className="w-full h-[54px] bg-red-600 text-white font-semibold hover:bg-red-700 transition-all">
                Entrar na área exclusiva
              </button>
              <button
                className={`w-full h-[54px] border font-semibold hover:opacity-70 transition
                  ${dark ? "border-zinc-600" : "border-zinc-300"}`}
              >
                Criar nova conta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PESQUISA (lupa do header) ── */}
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
                <button
                  type="submit"
                  className="h-[64px] px-8 bg-red-600 text-white font-bold text-[15px] hover:bg-red-700 transition-all"
                >
                  Buscar
                </button>
              </div>
            </form>

            <button
              onClick={() => setSearchOpen(false)}
              className="mt-5 text-zinc-400 text-[13px] hover:text-white transition flex items-center gap-2"
            >
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
        .fade-up {
          animation: fadeUp 0.6s ease forwards;
        }
      `}</style>

      {/* ── LOADING ── */}
      {loading && (
        <section className="max-w-[1600px] mx-auto px-4 md:px-5 py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_480px] gap-8 md:gap-12">
            <div>
              <Skeleton dark={dark} className="h-4 w-24 mb-4" />
              <Skeleton dark={dark} className="h-12 w-full mb-3" />
              <Skeleton dark={dark} className="h-12 w-2/3 mb-6" />
              <Skeleton dark={dark} className="w-full h-[400px]" />
            </div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton dark={dark} className="w-[120px] h-[90px] shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton dark={dark} className="h-3 w-16" />
                    <Skeleton dark={dark} className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAIXA EDITORIAL DE ABERTURA ── */}
      {!loading && (
        <div
          className={`border-b ${
            dark ? "border-zinc-800" : "border-zinc-200"
          }`}
        >
          <div className="max-w-[1600px] mx-auto px-4 md:px-5 h-[46px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-red-600">
                Ao vivo
              </span>
              <span
                className={`text-[12px] hidden sm:inline ${
                  dark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Cobertura contínua de inovação, IA e negócios
              </span>
            </div>
            <span
              className={`text-[12px] font-medium hidden md:inline ${
                dark ? "text-zinc-500" : "text-zinc-400"
              }`}
            >
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}
            </span>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      {!loading && featured && (
        <section className="max-w-[1600px] mx-auto px-4 md:px-5 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-[1.5fr_480px] gap-10 md:gap-14">
          <div className="fade-up">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-red-600 text-[12px] font-bold uppercase tracking-widest">
                {featured.category}
              </span>
              <span
                className={`text-[12px] flex items-center gap-1.5 ${
                  dark ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                <Clock3 size={12} />
                {timeAgo(featured.created_at)}
              </span>
            </div>

            <h1 className="text-[32px] sm:text-[40px] md:text-[56px] leading-[1.06] font-serif font-black tracking-tight max-w-[820px]">
              {featured.title}
            </h1>

            <p
              className={`text-[16px] md:text-[18px] leading-relaxed mt-6 max-w-[680px] ${
                dark ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              {featured.excerpt}
            </p>

            <Link
              href={`/noticia/${featured.slug}`}
              className="inline-flex items-center gap-2 mt-7 text-[13px] font-bold uppercase tracking-wider group"
            >
              <span className="border-b-2 border-black group-hover:border-red-600 group-hover:text-red-600 transition-colors pb-1 dark:border-white">
                Leia a matéria completa
              </span>
              <ArrowUpRight
                size={16}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-red-600 transition-all"
              />
            </Link>

            <Link href={`/noticia/${featured.slug}`}>
              <div className="relative w-full h-[260px] md:h-[480px] mt-9 overflow-hidden group">
                <img
                  src={
                    featured.image_url ||
                    "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
                  }
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10" />
              </div>
            </Link>
          </div>

          <div className="flex flex-col gap-7">
            <div className="flex items-center gap-3">
              <h2
                className={`text-[11px] font-bold uppercase tracking-widest ${
                  dark ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                Em destaque
              </h2>
              <div
                className={`flex-1 h-px ${
                  dark ? "bg-zinc-800" : "bg-zinc-200"
                }`}
              />
            </div>

            {sideArticles.map((item, i) => (
              <Link
                href={`/noticia/${item.slug}`}
                key={item.id}
                className={`group flex gap-5 pb-7 ${
                  i !== sideArticles.length - 1
                    ? `border-b ${dark ? "border-zinc-800" : "border-zinc-200"}`
                    : ""
                }`}
              >
                <span
                  className={`text-[26px] font-black leading-none w-7 shrink-0 select-none ${
                    dark ? "text-zinc-800" : "text-zinc-200"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-red-600 text-[11px] font-bold uppercase tracking-wider mb-2">
                    {item.category}
                  </p>
                  <h3 className="text-[16px] leading-[1.3] font-bold group-hover:text-red-600 transition-colors">
                    {item.title}
                  </h3>
                </div>

                {item.image_url && (
                  <div className="relative w-[88px] h-[66px] shrink-0 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
              </Link>
            ))}

            <div
              className={`p-7 border ${
                dark ? "bg-[#111] border-zinc-800" : "bg-[#fafafa] border-zinc-200"
              }`}
            >
              <span className="text-red-600 text-[10px] font-black uppercase tracking-widest block mb-3">
                Newsletter
              </span>
              <h3 className="text-[24px] font-serif font-bold leading-tight mb-3">
                O futuro dos negócios, direto no seu e-mail
              </h3>
              <p
                className={`text-[14px] leading-6 mb-6 ${
                  dark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Inovação, inteligência artificial e mercado — curadoria semanal sem ruído.
              </p>
              <input
                type="email"
                placeholder="Digite seu e-mail"
                className={`w-full h-[52px] border px-5 bg-transparent outline-none mb-3 text-[14px] focus:border-black transition-colors
                  ${dark ? "border-zinc-700 placeholder:text-zinc-500 text-white focus:border-white" : "border-zinc-300"}`}
              />
              <button className="w-full h-[52px] bg-black text-white font-semibold text-[14px] hover:bg-red-600 transition-colors">
                Assinar newsletter
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── TICKER DE MANCHETES ── */}
      {!loading && tickerArticles.length > 0 && (
        <div
          className={`border-y overflow-hidden ${
            dark ? "bg-[#0f0f0f] border-zinc-800" : "bg-black border-black"
          }`}
        >
          <div className="overflow-hidden whitespace-nowrap">
            <div
              className="flex gap-14 py-3.5 text-[13px] font-medium text-white"
              style={{ animation: "marquee 38s linear infinite" }}
            >
              {[...tickerArticles, ...tickerArticles].map((item, i) => (
                <Link
                  href={`/noticia/${item.slug}`}
                  key={`${item.id}-${i}`}
                  className="flex items-center gap-3 shrink-0 hover:text-red-500 transition-colors"
                >
                  <span className="text-red-500 font-bold text-[11px] uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── GRID PRINCIPAL ── */}
      {!loading && gridArticles.length > 0 && (
        <section className="max-w-[1600px] mx-auto px-4 md:px-5 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-9">
            <h2 className="text-[22px] md:text-[26px] font-serif font-black tracking-tight">
              Últimas notícias
            </h2>
            <div
              className={`flex-1 h-px ${dark ? "bg-zinc-800" : "bg-zinc-200"}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {gridArticles.map((item) => (
              <Link
                href={`/noticia/${item.slug}`}
                key={item.id}
                className="group block"
              >
                {item.image_url && (
                  <div className="relative w-full h-[230px] overflow-hidden mb-5">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-red-600 text-[11px] font-bold uppercase tracking-widest">
                    {item.category}
                  </span>
                  <span
                    className={`text-[11px] flex items-center gap-1 ${
                      dark ? "text-zinc-500" : "text-zinc-400"
                    }`}
                  >
                    <Clock3 size={11} />
                    {timeAgo(item.created_at)}
                  </span>
                </div>
                <h3 className="text-[19px] leading-[1.25] font-bold mb-3 group-hover:text-red-600 transition-colors">
                  {item.title}
                </h3>
                <p
                  className={`text-[14px] leading-relaxed line-clamp-2 ${
                    dark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  {item.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── FAIXA INSTITUCIONAL ── */}
      {!loading && (
        <section
          className={`border-t ${
            dark ? "border-zinc-800 bg-[#0f0f0f]" : "border-zinc-200 bg-[#fafafa]"
          }`}
        >
          <div className="max-w-[1600px] mx-auto px-4 md:px-5 py-14 md:py-20 grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
            <div>
              <span className="text-red-600 text-[11px] font-black uppercase tracking-widest block mb-3">
                Nosso compromisso
              </span>
              <h3 className="text-[22px] font-serif font-bold leading-tight mb-3">
                Inovação como editoria principal
              </h3>
              <p
                className={`text-[14px] leading-relaxed ${
                  dark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Cobrimos o que está reescrevendo o mercado — IA, tecnologia e os negócios que vêm a seguir.
              </p>
            </div>
            <div>
              <span className="text-red-600 text-[11px] font-black uppercase tracking-widest block mb-3">
                Curadoria
              </span>
              <h3 className="text-[22px] font-serif font-bold leading-tight mb-3">
                Relevância acima de volume
              </h3>
              <p
                className={`text-[14px] leading-relaxed ${
                  dark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Cada matéria publicada passa por critério editorial — sem ruído, sem clickbait.
              </p>
            </div>
            <div>
              <span className="text-red-600 text-[11px] font-black uppercase tracking-widest block mb-3">
                Design premium
              </span>
              <h3 className="text-[22px] font-serif font-bold leading-tight mb-3">
                Uma leitura à altura do conteúdo
              </h3>
              <p
                className={`text-[14px] leading-relaxed ${
                  dark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Experiência editorial pensada para quem decide rápido e exige profundidade.
              </p>
            </div>
          </div>
        </section>
      )}

    </main>

  </>

);
}