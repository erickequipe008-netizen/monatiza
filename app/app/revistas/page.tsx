"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { fetchByCategory, type ArticleCard } from "@/lib/premium/articles";
import { BigCard } from "@/components/premium/PremiumCards";
import { Spinner, EmptyState, PageHeader } from "@/components/premium/States";

export default function RevistasPage() {
  const [items, setItems] = useState<ArticleCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      setItems(await fetchByCategory("%Revista%", 48));
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (a) =>
        a.title?.toLowerCase().includes(term) || a.excerpt?.toLowerCase().includes(term)
    );
  }, [q, items]);

  return (
    <div>
      <PageHeader
        eyebrow={<><BookOpen size={14} /> Revista Monatiza</>}
        title="Revistas digitais"
        subtitle="Reportagens especiais, grandes perfis e edições para ler com calma."
      />

      <div className="relative mb-8 max-w-md">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar edições e reportagens…"
          className="w-full rounded-full border border-zinc-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-zinc-500"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length ? (
        <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <BigCard key={a.id} a={a} />
          ))}
        </div>
      ) : (
        <EmptyState icon={BookOpen} title="Nenhuma edição encontrada." />
      )}
    </div>
  );
}
