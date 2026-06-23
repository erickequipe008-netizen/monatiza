"use client";

import { useRef, useEffect } from "react";
import { X } from "lucide-react";

interface SearchModalProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function SearchModal({ searchQuery, onSearchChange, onSearch, onClose }: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-start pt-20 md:pt-28 px-5">
      <div className="w-full max-w-[720px]">
        <form onSubmit={onSearch}>
          <div className="flex items-center gap-0">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="O que você está procurando?"
              className="flex-1 h-[56px] md:h-[64px] px-5 md:px-6 bg-[#111] border border-zinc-700 outline-none text-[16px] md:text-[18px] text-white placeholder:text-zinc-500"
            />
            <button type="submit" className="h-[56px] md:h-[64px] px-6 md:px-8 bg-red-600 text-white font-bold text-[14px] md:text-[15px] hover:bg-red-700 transition-all whitespace-nowrap">
              Buscar
            </button>
          </div>
        </form>
        <button onClick={onClose} className="mt-5 text-zinc-400 text-[13px] hover:text-white transition flex items-center gap-2">
          <X size={14} /> Fechar pesquisa
        </button>
      </div>
    </div>
  );
}
