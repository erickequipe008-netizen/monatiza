"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, Moon, Sun, X } from "lucide-react";
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

  const dark = darkMode;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirecionar para página de busca
      window.location.href = `/busca?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (

  <>

    <Header />

    <main
      className={dark ? "bg-[#0a0a0a] text-white" : "bg-[#f7f7f7] text-black"}
      style={{
        margin: 0,
        padding: 0,
      }}
    >
      {/* ── MEGA MENU ESTILO FORBES ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />

          {/* Painel */}
          <aside className="relative z-10 w-full max-w-[860px] h-full bg-[#111] text-white overflow-y-auto flex flex-col">

            {/* Topo do menu */}
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

            {/* Barra de busca interna do menu */}
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

            {/* Grid de colunas */}
            <div className="px-10 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1.1fr_0.8fr] gap-10 flex-1">
              {/* COLUNA 1: Editorias */}
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

              {/* COLUNA 2: Inside */}
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

              {/* COLUNA 3: Listas */}
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

              {/* COLUNA 4: Newsletter + Redes */}
              <div className="flex flex-col gap-6">
                {/* Card Newsletter */}
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

                {/* Redes sociais */}
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
                placeholder="Seu e-mail"
                className={`w-full h-[54px] px-5 border bg-transparent outline-none
                  ${dark ? "border-zinc-700 placeholder:text-zinc-500 text-white" : "border-zinc-300"}`}
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
              <button className={`w-full h-[54px] border font-semibold hover:opacity-70 transition
                ${dark ? "border-zinc-600" : "border-zinc-300"}`}>
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
      `}</style>

      {/* ── LOADING ── */}
      {loading && (
        <div className="flex items-center justify-center py-32 text-zinc-400 text-sm">
          Carregando artigos...
        </div>
      )}

      {/* ── HERO ── */}
      {!loading && featured && (
        <section className="max-w-[1600px] mx-auto px-4 md:px-5 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-[1.5fr_520px] gap-8 md:gap-10">
          <div>
            <p className="text-red-600 text-[13px] font-bold uppercase mb-4">{featured.category}</p>
            <h1 className="text-[34px] sm:text-[42px] md:text-[58px] leading-[1.1] font-serif font-bold tracking-tight max-w-[900px]">
              {featured.title}
            </h1>
            <p className="text-zinc-500 text-[15px] leading-7 mt-5 max-w-[900px]">{featured.excerpt}</p>
            <Link href={`/noticia/${featured.slug}`}>
              <div className="relative w-full h-[260px] md:h-[560px] mt-8 overflow-hidden bg-zinc-200">
                <img
                  src={featured.image_url || "https://images.unsplash.com/photo-1498050108023-c5249f4df085"}
                  alt={featured.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </Link>
          </div>

          <div className="flex flex-col gap-8">
            {sideArticles.map((item) => (
              <Link href={`/noticia/${item.slug}`} key={item.id}
                className={`border-b pb-8 ${dark ? "border-zinc-800" : "border-zinc-200"}`}>
                <div className="grid grid-cols-[110px_1fr] md:grid-cols-[140px_1fr] gap-4 md:gap-5 items-start">
                  {item.image_url && (
                    <div className="relative w-full h-[100px] overflow-hidden">
                      <img src={item.image_url} alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div>
                    <p className="text-red-600 text-[12px] font-bold uppercase mb-2">{item.category}</p>
                    <h2 className="text-[16px] leading-[1.2] font-bold">{item.title}</h2>
                  </div>
                </div>
              </Link>
            ))}

            <div className={`p-7 border ${dark ? "bg-[#111] border-zinc-800" : "bg-white border-zinc-200"}`}>
              <h3 className="text-[28px] font-serif font-bold mb-4">Newsletter MONATIZA</h3>
              <p className="text-zinc-500 text-[14px] leading-7 mb-6">
                Receba notícias exclusivas, análises de mercado, tecnologia e tendências diretamente no seu e-mail.
              </p>
              <input type="email" placeholder="Digite seu e-mail"
                className={`w-full h-[54px] border px-5 bg-transparent outline-none mb-4
                  ${dark ? "border-zinc-700 placeholder:text-zinc-500 text-white" : "border-zinc-300"}`}
              />
              <button className="w-full h-[54px] bg-black text-white font-semibold hover:bg-zinc-800 transition-all">
                Assinar newsletter
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── GRID ── */}
      {!loading && (
        <section className="max-w-[1600px] mx-auto px-4 md:px-5 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {gridArticles.map((item) => (
            <Link href={`/noticia/${item.slug}`} key={item.id}
              className={`border-t pt-5 group ${dark ? "border-zinc-800" : "border-zinc-200"}`}>
              {item.image_url && (
                <div className="relative w-full h-[240px] overflow-hidden mb-5">
                  <img src={item.image_url} alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <p className="text-red-600 text-[12px] font-bold uppercase mb-3">{item.category}</p>
              <h2 className="text-[18px] leading-[1.15] font-bold mb-4 group-hover:text-red-600 transition-colors">
                {item.title}
              </h2>
              <p className="text-zinc-500 text-[14px] leading-7">{item.excerpt}</p>
            </Link>
          ))}
        </section>
      )}

        </main>

  </>

);