```tsx
"use client";

import { useState } from "react";
import {
  Menu,
  Search,
  X,
  Moon,
} from "lucide-react";

export default function Header() {

  const [menuOpen, setMenuOpen] = useState(false);

  return (

    <>

      {/* HEADER */}

      <header
        className="
        sticky top-0 z-50
        bg-black
        text-white
        border-b border-zinc-800
      "
      >

        <div
          className="
          max-w-[1600px]
          mx-auto
          h-[86px]
          px-6
          flex
          items-center
          justify-between
        "
        >

          {/* ESQUERDA */}

          <div className="flex items-center gap-5">

            <button
              onClick={() => setMenuOpen(true)}
              className="hover:opacity-70 transition"
            >
              <Menu size={30} />
            </button>

            <button className="hover:opacity-70 transition">
              <Search size={28} />
            </button>

          </div>

          {/* LOGO */}

          <a href="/">

            <h1
              className="
              text-[44px]
              font-black
              uppercase
              tracking-tight
              font-serif
            "
            >
              monatiza
            </h1>

          </a>

          {/* DIREITA */}

          <div className="flex items-center gap-5">

            <button className="hover:opacity-70 transition">
              <Moon size={22} />
            </button>

            <a
              href="/assinar"
              className="
                border border-white
                px-6 py-3
                text-sm font-semibold
                hover:bg-white
                hover:text-black
                transition
              "
            >
              Assinar
            </a>

          </div>

        </div>

      </header>

      {/* MENU FULLSCREEN */}

      {menuOpen && (

        <div
          className="
          fixed inset-0
          z-[999]
          bg-[#0a0a0a]
          text-white
          overflow-y-auto
        "
        >

          <div
            className="
            max-w-[1600px]
            mx-auto
            px-16
            py-10
          "
          >

            {/* TOPO */}

            <div
              className="
              flex
              items-center
              justify-between
              mb-14
            "
            >

              <h2
                className="
                text-6xl
                font-black
                font-serif
                uppercase
              "
              >
                MONATIZA
              </h2>

              <button
                onClick={() => setMenuOpen(false)}
                className="hover:opacity-70 transition"
              >
                <X size={42} />
              </button>

            </div>

            {/* BUSCA */}

            <div className="mb-20">

              <div
                className="
                border border-zinc-700
                h-[72px]
                flex items-center
                px-6
              "
              >

                <input
                  type="text"
                  placeholder="Digite sua pesquisa"
                  className="
                    bg-transparent
                    outline-none
                    w-full
                    text-2xl
                    placeholder:text-zinc-500
                  "
                />

                <button
                  className="
                  text-lg
                  font-semibold
                  hover:opacity-70
                "
                >
                  Buscar
                </button>

              </div>

            </div>

            {/* GRID */}

            <div
              className="
              grid
              grid-cols-4
              gap-20
            "
            >

              {/* COLUNA 1 */}

              <div>

                <h3
                  className="
                  text-zinc-500
                  uppercase
                  text-sm
                  mb-8
                  tracking-[2px]
                "
                >
                  Editorias
                </h3>

                <div
                  className="
                  flex
                  flex-col
                  gap-6
                  text-[34px]
                  font-bold
                "
                >

                  <a href="#" className="hover:text-zinc-400">
                    Negócios
                  </a>

                  <a href="#" className="hover:text-zinc-400">
                    Brasil
                  </a>

                  <a href="#" className="hover:text-zinc-400">
                    Startups
                  </a>

                  <a href="#" className="hover:text-zinc-400">
                    Revista
                  </a>

                </div>

              </div>

              {/* COLUNA 2 */}

              <div>

                <h3
                  className="
                  text-zinc-500
                  uppercase
                  text-sm
                  mb-8
                  tracking-[2px]
                "
                >
                  Tecnologia
                </h3>

                <div
                  className="
                  flex
                  flex-col
                  gap-6
                  text-[34px]
                  font-bold
                "
                >

                  <a href="#" className="hover:text-zinc-400">
                    IA
                  </a>

                  <a href="#" className="hover:text-zinc-400">
                    Tech
                  </a>

                  <a href="#" className="hover:text-zinc-400">
                    Carreira
                  </a>

                </div>

              </div>

              {/* COLUNA 3 */}

              <div>

                <h3
                  className="
                  text-zinc-500
                  uppercase
                  text-sm
                  mb-8
                  tracking-[2px]
                "
                >
                  Destaques
                </h3>

                <div className="flex flex-col gap-8">

                  <div className="border-b border-zinc-800 pb-6">

                    <p
                      className="
                      text-red-500
                      text-sm
                      font-semibold
                      mb-3
                    "
                    >
                      IA
                    </p>

                    <h4
                      className="
                      text-2xl
                      font-bold
                      leading-tight
                    "
                    >
                      As startups de IA que estão dominando 2026
                    </h4>

                  </div>

                  <div className="border-b border-zinc-800 pb-6">

                    <p
                      className="
                      text-red-500
                      text-sm
                      font-semibold
                      mb-3
                    "
                    >
                      MERCADO
                    </p>

                    <h4
                      className="
                      text-2xl
                      font-bold
                      leading-tight
                    "
                    >
                      Bitcoin dispara e mercado reage
                    </h4>

                  </div>

                  <div>

                    <p
                      className="
                      text-red-500
                      text-sm
                      font-semibold
                      mb-3
                    "
                    >
                      TECH
                    </p>

                    <h4
                      className="
                      text-2xl
                      font-bold
                      leading-tight
                    "
                    >
                      Como a IA está mudando os portais
                    </h4>

                  </div>

                </div>

              </div>

              {/* COLUNA 4 */}

              <div>

                <div
                  className="
                  border border-zinc-800
                  p-8
                "
                >

                  <h3
                    className="
                    text-4xl
                    font-black
                    leading-tight
                    mb-6
                  "
                  >
                    Assine a MONATIZA
                  </h3>

                  <p
                    className="
                    text-zinc-400
                    text-lg
                    leading-relaxed
                    mb-8
                  "
                  >
                    Tenha acesso a conteúdos exclusivos,
                    análises premium e inteligência
                    de mercado.
                  </p>

                  <a
                    href="/assinar"
                    className="
                    block
                    bg-white
                    text-black
                    text-center
                    py-4
                    font-bold
                    text-lg
                    hover:opacity-80
                    transition
                  "
                  >
                    Assinar agora
                  </a>

                  <div
                    className="
                    mt-10
                    flex
                    gap-5
                    text-zinc-500
                  "
                  >

                    <p>Instagram</p>
                    <p>X</p>
                    <p>LinkedIn</p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </>

  );

}
```
