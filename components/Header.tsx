"use client";

import Link from "next/link";
import { useState } from "react";

import {
  Menu,
  Search,
  Moon,
  Sun,
  X,
} from "lucide-react";

export default function Header() {

  const [darkMode, setDarkMode] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [loginOpen, setLoginOpen] =
    useState(false);

  return (
    <>

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-50 bg-black text-white border-b border-zinc-800">

        {/* TOPO */}
        <div className="max-w-[1600px] mx-auto h-[64px] md:h-[78px] px-4 md:px-5 flex items-center justify-between">

          {/* ESQUERDA */}
          <div className="flex items-center">

            <button
              onClick={() => setMenuOpen(true)}
              className="hover:opacity-70 transition"
            >
              <Menu size={24} />
            </button>

          </div>

          {/* LOGO */}
          <Link href="/">
            <h1 className="text-[24px] md:text-[42px] font-serif font-black tracking-tight">
              monatiza
            </h1>
          </Link>

          {/* MOBILE SEARCH */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hover:opacity-70 transition md:hidden"
          >
            <Search size={22} />
          </button>

          {/* DESKTOP RIGHT */}
          <div className="hidden md:flex items-center gap-5">

            <button
              onClick={() => setSearchOpen(true)}
              className="hover:opacity-70 transition"
            >
              <Search size={20} />
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="hover:opacity-70 transition"
            >
              {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>

            <button
              onClick={() => setLoginOpen(true)}
              className="
                border
                border-white
                px-5
                py-3
                text-[14px]
                font-semibold
                hover:bg-white
                hover:text-black
                transition
              "
            >
              Assinar
            </button>

          </div>

        </div>

        {/* CATEGORIAS */}
        <div className="border-t border-zinc-800 bg-black">

          <div
            className="
              max-w-[1600px]
              mx-auto
              h-[44px]
              md:h-[50px]
              px-4
              md:px-5
              flex
              items-center
              gap-5
              md:gap-7
              overflow-x-auto
              whitespace-nowrap
              text-[12px]
              md:text-[14px]
              font-semibold
            "
          >

            {[
              "Negócios",
              "IA",
              "Mercado",
              "Brasil",
              "Tech",
              "Empreende",
              "Startups",
              "Carreira",
              "Assinantes",
              "Revista",
            ].map((cat) => (

              <button
                key={cat}
                className="hover:text-red-500 transition shrink-0"
              >
                {cat}
              </button>

            ))}

          </div>

        </div>

      </header>

      {/* ESPAÇO HEADER */}
      <div className="h-[108px] md:h-[128px]" />

      {/* ANIMAÇÃO */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>

      {/* TICKER FINANCEIRO */}
      <div
        className={`border-b overflow-hidden ${
          darkMode
            ? "bg-[#111] border-zinc-800"
            : "bg-[#f5f5f5] border-zinc-200"
        }`}
      >

        <div className="overflow-hidden whitespace-nowrap">

          <div
            className="flex gap-16 py-3 text-[13px] font-semibold"
            style={{
              animation: "marquee 30s linear infinite",
            }}
          >

            {[
              { label: "IBOV ▲ 128.420 +1,22%", up: true },
              { label: "DÓLAR ▼ R$5,42 -0,32%", up: false },
              { label: "NASDAQ ▲ +0,88%", up: true },
              { label: "BITCOIN ▲ US$108.220", up: true },
              { label: "PETR4 ▼ -1,04%", up: false },
              { label: "VALE3 ▲ +2,18%", up: true },
              { label: "ETHEREUM ▲ US$4.180", up: true },
              { label: "IBOV ▲ 128.420 +1,22%", up: true },
              { label: "DÓLAR ▼ R$5,42 -0,32%", up: false },
              { label: "NASDAQ ▲ +0,88%", up: true },
            ].map((item, i) => (

              <span
                key={i}
                className={
                  item.up
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {item.label}
              </span>

            ))}

          </div>

        </div>

      </div>

      {/* MENU */}
      {menuOpen && (

        <div className="fixed inset-0 z-[999] bg-black/70">

          <div
            className="
              w-full
              md:w-[420px]
              h-full
              bg-[#111]
              text-white
              p-6
            "
          >

            {/* TOPO MENU */}
            <div className="flex items-center justify-between mb-8">

              <h2 className="text-2xl font-bold">
                Menu
              </h2>

              <button
                onClick={() => setMenuOpen(false)}
              >
                <X size={28} />
              </button>

            </div>

            {/* LINKS */}
            <div className="flex flex-col gap-5">

              {[
                "Negócios",
                "IA",
                "Mercado",
                "Brasil",
                "Tech",
                "Empreende",
                "Startups",
                "Carreira",
                "Assinantes",
                "Revista",
              ].map((item) => (

                <button
                  key={item}
                  className="
                    text-left
                    text-lg
                    hover:text-red-500
                    transition
                  "
                >
                  {item}
                </button>

              ))}

            </div>

            {/* MOBILE EXTRA */}
            <div className="mt-10 border-t border-zinc-800 pt-8 flex flex-col gap-4 md:hidden">

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="
                  flex
                  items-center
                  gap-3
                  text-left
                  text-lg
                "
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                Alterar tema
              </button>

              <button
                onClick={() => setLoginOpen(true)}
                className="
                  border
                  border-white
                  py-4
                  text-sm
                  font-bold
                  hover:bg-white
                  hover:text-black
                  transition
                "
              >
                Assinar
              </button>

            </div>

          </div>

        </div>

      )}

      {/* BUSCA */}
      {searchOpen && (

        <div className="fixed inset-0 z-[999] bg-black/80 flex items-start justify-center pt-32 px-5">

          <div className="w-full max-w-[700px]">

            <div className="flex gap-0">

              <input
                type="text"
                placeholder="Pesquisar..."
                className="
                  flex-1
                  h-[60px]
                  px-5
                  bg-[#111]
                  border
                  border-zinc-700
                  text-white
                  outline-none
                "
              />

              <button
                className="
                  bg-red-600
                  px-8
                  text-white
                  font-bold
                "
              >
                Buscar
              </button>

            </div>

            <button
              onClick={() => setSearchOpen(false)}
              className="mt-5 text-zinc-400"
            >
              Fechar
            </button>

          </div>

        </div>

      )}

      {/* LOGIN */}
      {loginOpen && (

        <div className="fixed inset-0 z-[999] bg-black/70 flex items-center justify-center p-5">

          <div
            className="
              w-full
              max-w-[420px]
              bg-white
              text-black
              p-8
              rounded-2xl
            "
          >

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-3xl font-bold">
                Assinar
              </h2>

              <button
                onClick={() => setLoginOpen(false)}
              >
                <X size={24} />
              </button>

            </div>

            <input
              type="email"
              placeholder="Seu e-mail"
              className="
                w-full
                border
                border-zinc-300
                px-4
                py-4
                rounded-xl
                mb-4
              "
            />

            <button
              className="
                w-full
                bg-black
                text-white
                py-4
                rounded-xl
                font-bold
              "
            >
              Continuar
            </button>

          </div>

        </div>

      )}

    </>
  );
}