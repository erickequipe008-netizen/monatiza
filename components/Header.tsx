"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Menu, Search, Moon, Sun, X, ChevronRight } from "lucide-react";

import { NAV_ITEMS } from "@/lib/categories";
import { iconFor } from "@/components/iconMap";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

export default function Header() {
  const pathname = usePathname();
  const { isSubscriber } = useSubscriber();

  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const accountHref = isSubscriber ? "/app" : "/assinantes";
  const accountLabel = isSubscriber ? "Minha conta" : "Assinar";

  return (
    <>
      {/* animação do menu lateral */}
      <style>{`@keyframes drawerIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black text-white border-b border-zinc-800">
        {/* TOPO */}
        <div className="max-w-[1600px] mx-auto h-[64px] md:h-[78px] px-4 md:px-5 flex items-center justify-between">
          {/* ESQUERDA — botão do menu */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            className="flex items-center gap-2 -ml-2 px-2.5 py-2 rounded-md hover:bg-white/10 transition"
          >
            <Menu size={24} />
            <span className="hidden sm:inline text-[13px] font-semibold tracking-wide">Menu</span>
          </button>

          {/* LOGO */}
          <Link href="/">
            <h1 className="text-[24px] md:text-[42px] font-serif font-black tracking-tight">
              monatiza
            </h1>
          </Link>

          {/* MOBILE SEARCH */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Buscar"
            className="hover:opacity-70 transition md:hidden"
          >
            <Search size={22} />
          </button>

          {/* DESKTOP RIGHT */}
          <div className="hidden md:flex items-center gap-5">
            <button onClick={() => setSearchOpen(true)} aria-label="Buscar" className="hover:opacity-70 transition">
              <Search size={20} />
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Alterar tema"
              className="hover:opacity-70 transition"
            >
              {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>

            <Link
              href={accountHref}
              className="border border-white px-5 py-3 text-[14px] font-semibold hover:bg-white hover:text-black transition"
            >
              {accountLabel}
            </Link>
          </div>
        </div>

        {/* CATEGORIAS */}
        <div className="border-t border-zinc-800 bg-black">
          <nav
            className="max-w-[1600px] mx-auto h-[44px] md:h-[50px] px-4 md:px-5 flex items-center gap-5 md:gap-7 overflow-x-auto whitespace-nowrap text-[12px] md:text-[14px] font-semibold"
          >
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 transition ${active ? "text-red-500" : "hover:text-red-500"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ESPAÇO HEADER */}
      <div className="h-[108px] md:h-[128px]" />

      {/* MENU LATERAL */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="w-full md:w-[400px] h-full bg-[#0d0d0d] text-white flex flex-col shadow-2xl"
            style={{ animation: "drawerIn .25s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* topo do menu */}
            <div className="flex items-center justify-between px-6 h-[64px] md:h-[78px] border-b border-zinc-800 shrink-0">
              <span className="text-[22px] font-serif font-black tracking-tight">monatiza</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Fechar menu" className="hover:opacity-70 transition">
                <X size={26} />
              </button>
            </div>

            {/* categorias (rolável) */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <p className="px-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                Categorias
              </p>
              {NAV_ITEMS.map((item) => {
                const Icon = iconFor(item.icon);
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                      active ? "bg-red-600/15 text-red-500" : "text-zinc-200 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={active ? "text-red-500" : "text-zinc-500 group-hover:text-red-500 transition"}
                    />
                    <span className="flex-1 text-[15px] font-semibold">{item.label}</span>
                    <ChevronRight size={16} className="text-zinc-600 transition group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </nav>

            {/* rodapé do menu: tema + assinar */}
            <div className="border-t border-zinc-800 p-5 space-y-3 shrink-0">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-3 w-full text-left text-sm text-zinc-300 hover:text-white transition py-1"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                Alterar tema
              </button>
              <Link
                href={accountHref}
                onClick={() => setMenuOpen(false)}
                className="block w-full bg-red-600 py-3.5 text-center text-sm font-bold hover:bg-red-700 transition"
              >
                {accountLabel}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* BUSCA */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/80 flex items-start justify-center pt-32 px-5"
          onClick={() => setSearchOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              const q = searchQuery.trim();
              if (q) window.location.href = `/busca?q=${encodeURIComponent(q)}`;
            }}
            className="w-full max-w-[700px]"
          >
            <div className="flex gap-0">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar..."
                className="flex-1 h-[60px] px-5 bg-[#111] border border-zinc-700 text-white outline-none"
              />
              <button type="submit" className="bg-red-600 px-8 text-white font-bold">
                Buscar
              </button>
            </div>
            <button type="button" onClick={() => setSearchOpen(false)} className="mt-5 text-zinc-400">
              Fechar
            </button>
          </form>
        </div>
      )}
    </>
  );
}
