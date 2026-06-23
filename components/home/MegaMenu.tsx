"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { EDITORIAS, INSIDE, LISTAS } from "./constants";

interface MegaMenuProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onClose: () => void;
  onOpenLogin: () => void;
}

export function MegaMenu({ searchQuery, onSearchChange, onSearch, onClose, onOpenLogin }: MegaMenuProps) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <aside className="relative z-10 w-full max-w-[860px] h-full bg-[#111] text-white overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-6 md:px-10 py-7 border-b border-zinc-800">
          <Link href="/" onClick={onClose}>
            <span className="text-[24px] md:text-[28px] font-serif font-black tracking-tight">monatiza</span>
          </Link>
          <button aria-label="Fechar menu" onClick={onClose} className="hover:opacity-60 transition p-1">
            <X size={26} />
          </button>
        </div>
        <div className="px-6 md:px-10 py-6 border-b border-zinc-800">
          <form onSubmit={onSearch} className="flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Digite sua pesquisa"
              className="flex-1 h-[54px] px-5 bg-transparent border border-zinc-700 outline-none text-[15px] placeholder:text-zinc-500 text-white"
            />
            <button type="submit" className="h-[54px] px-7 bg-white text-black font-semibold text-[14px] hover:bg-zinc-200 transition-all">
              Buscar
            </button>
          </form>
        </div>
        <div className="px-6 md:px-10 py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1.1fr_0.8fr] gap-8 md:gap-10 flex-1">
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-6">Editorias Monatiza</h4>
            <ul className="flex flex-col gap-4">
              {EDITORIAS.map((item) => (
                <li key={item.label} className="flex items-center justify-between group">
                  <button onClick={onClose} className="text-[14px] font-medium text-left hover:text-red-500 transition-colors">
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
                  <button onClick={onClose} className="text-[14px] font-medium text-left hover:text-red-500 transition-colors">
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
                  <button onClick={onClose} className="text-[14px] font-medium text-left hover:text-red-500 transition-colors">
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
              <button
                onClick={() => { onClose(); onOpenLogin(); }}
                className="text-[12px] font-bold uppercase tracking-wider underline hover:no-underline transition"
              >
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
  );
}
