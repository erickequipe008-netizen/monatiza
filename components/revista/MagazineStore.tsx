"use client";

import { useMemo, useState } from "react";
import { Search, BookOpen } from "lucide-react";
import { MAGAZINE_CATEGORIES, type MagazinePublic } from "@/types/magazine";
import MagazineCard from "@/components/revista/MagazineCard";

const FILTERS = ["Todos", ...MAGAZINE_CATEGORIES] as const;

/** Loja de revistas: hero, busca (título/edição), filtro por categoria e grade. */
export default function MagazineStore({ magazines }: { magazines: MagazinePublic[] }) {
 const [q, setQ] = useState("");
 const [cat, setCat] = useState<(typeof FILTERS)[number]>("Todos");

 const results = useMemo(() => {
 const term = q.trim().toLowerCase();
 return magazines.filter((m) => {
 const matchCat = cat === "Todos" || (m.category || "").toLowerCase() === cat.toLowerCase();
 if (!matchCat) return false;
 if (!term) return true;
 return (
 m.title.toLowerCase().includes(term) ||
 (m.subtitle || "").toLowerCase().includes(term) ||
 (m.edition || "").toLowerCase().includes(term) ||
 (m.category || "").toLowerCase().includes(term)
 );
 });
 }, [magazines, q, cat]);

 return (
 <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
 {/* Hero */}
 <header className="mb-8 md:mb-10">
 <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#dc2626]">Monatiza · Revistas</p>
 <h1 className="mt-2 text-[34px] font-black leading-[1.05] tracking-tight text-zinc-900 md:text-[46px]">
 Edições digitais
 <br className="hidden sm:block" /> para quem pensa grande.
 </h1>
 <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-zinc-500">
 Reportagens especiais, análises e grandes histórias em PDF. Compre, receba por e-mail e leia onde quiser.
 </p>
 </header>

 {/* Busca + filtros */}
 <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
 <div className="relative w-full md:max-w-xs">
 <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
 <input
 value={q}
 onChange={(e) => setQ(e.target.value)}
 placeholder="Buscar por título ou edição…"
 className="w-full rounded-full border border-black/10 bg-white py-2.5 pl-10 pr-4 text-[14px] text-zinc-900 outline-none transition focus:border-[#dc2626]"
 />
 </div>
 <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
 {FILTERS.map((f) => (
 <button
 key={f}
 onClick={() => setCat(f)}
 className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition ${
 cat === f
 ? "bg-[#dc2626] text-white"
 : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
 }`}
 >
 {f}
 </button>
 ))}
 </div>
 </div>

 {/* Grade */}
 {results.length === 0 ? (
 <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-black/10 py-20 text-center">
 <BookOpen size={40} className="text-zinc-300" />
 <p className="mt-4 text-[15px] font-semibold text-zinc-500">
 {magazines.length === 0 ? "Nenhuma edição publicada ainda." : "Nada encontrado para essa busca."}
 </p>
 </div>
 ) : (
 <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
 {results.map((m) => (
 <MagazineCard key={m.id} m={m} />
 ))}
 </div>
 )}
 </div>
 );
}
