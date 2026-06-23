"use client";

import { NAV_EDITORIAS } from "./constants";

interface NaveditoriasProps {
  dark: boolean;
}

export function NavEditorias({ dark }: NaveditoriasProps) {
  return (
    <div className={`border-b sticky top-0 z-40 ${dark ? "bg-[#0d0d0d] border-zinc-800" : "bg-white border-zinc-200"}`}>
      <div className="max-w-[1280px] mx-auto px-3 md:px-4 flex items-center gap-0 overflow-x-auto scrollbar-hide">
        {NAV_EDITORIAS.map((ed) => (
          <button
            key={ed}
            className={`nav-item shrink-0 h-[46px] px-3 md:px-4 text-[12px] md:text-[13px] font-semibold hover:text-red-600 transition-colors whitespace-nowrap ${dark ? "text-zinc-300" : "text-zinc-700"}`}
          >
            {ed}
            <span className="nav-underline" />
          </button>
        ))}
      </div>
    </div>
  );
}
