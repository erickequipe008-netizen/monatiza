"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { fetchPublishedMagazines } from "@/lib/premium/magazines-client";
import { MAGAZINE_CATEGORIES, type MagazinePublic } from "@/types/magazine";
import MagazineCardDark from "@/components/premium/MagazineCardDark";
import { Spinner, EmptyState, PageHeader } from "@/components/premium/States";

const FILTERS = ["Todos", ...MAGAZINE_CATEGORIES] as const;

export default function RevistasPage() {
  const [items, setItems] = useState<MagazinePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof FILTERS)[number]>("Todos");

  useEffect(() => {
    (async () => {
      setItems(await fetchPublishedMagazines(48));
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((m) => {
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
  }, [q, cat, items]);

  return (
    <div>
      <PageHeader
        eyebrow={<><BookOpen size={14} /> Revista Monatiza</>}
        title="Revistas digitais"
        subtitle="Reportagens especiais, grandes perfis e edições para ler com calma."
      />

      {/* Busca + filtros */}
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar edições e reportagens…"
            className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#1d9bf0]"
          />
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setCat(f)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition ${
                cat === f
                  ? "bg-[#1d9bf0] text-white"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((m) => (
            <MagazineCardDark key={m.id} m={m} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title={items.length === 0 ? "Nenhuma edição publicada ainda." : "Nada encontrado para essa busca."}
        />
      )}
    </div>
  );
}
