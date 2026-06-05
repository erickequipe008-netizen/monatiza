"use client";

import { useState } from "react";
import { Menu, Search, X, Moon } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-black text-white border-b border-zinc-800">
        <div className="max-w-[1600px] mx-auto h-[86px] px-6 flex items-center justify-between">
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

          <a href="/">
            <h1 className="text-[44px] font-black uppercase tracking-tight font-serif">
              monatiza
            </h1>
          </a>

          <div className="flex items-center gap-5">
            <button className="hover:opacity-70 transition">
              <Moon size={22} />
            </button>

            <a
              href="/assinar"
              className="border border-white px-6 py-3 text-sm font-semibold hover:bg-white hover:text-black transition"
            >
              Assinar
            </a>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[999] bg-[#0a0a0a] text-white overflow-y-auto">
          <div className="max-w-[1600px] mx-auto px-16 py-10">
            <div className="flex items-center justify-between mb-14">
              <h2 className="text-6xl font-black font-serif uppercase">
                MONATIZA
              </h2>

              <button
                onClick={() => setMenuOpen(false)}
                className="hover:opacity-70 transition"
              >
                <X size={42} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}