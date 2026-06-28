"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import {
  getSaved,
  getLiked,
  getHistory,
  getContinueReading,
} from "@/lib/premium/library";
import type { ArticleCard } from "@/lib/premium/articles";
import { RowCard } from "@/components/premium/PremiumCards";
import { Spinner, EmptyState, PageHeader } from "@/components/premium/States";

const TABS = [
  { key: "continue", label: "Continuar lendo" },
  { key: "saved", label: "Salvos" },
  { key: "liked", label: "Curtidos" },
  { key: "history", label: "Histórico" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function BibliotecaPage() {
  const [tab, setTab] = useState<TabKey>("continue");
  const [items, setItems] = useState<ArticleCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      let data: ArticleCard[] = [];
      if (tab === "saved") data = await getSaved();
      else if (tab === "liked") data = await getLiked();
      else if (tab === "history") data = await getHistory();
      else data = await getContinueReading();
      if (active) {
        setItems(data);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [tab]);

  const emptyMsg: Record<TabKey, string> = {
    continue: "Você não tem leituras em andamento.",
    saved: "Você ainda não salvou nenhuma matéria.",
    liked: "Você ainda não curtiu nenhuma matéria.",
    history: "Seu histórico de leitura aparece aqui.",
  };

  return (
    <div>
      <PageHeader eyebrow={<><Bookmark size={14} /> Biblioteca</>} title="Sua biblioteca" />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${
              tab === t.key ? "bg-[#0b0b0c] text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : items.length ? (
        <div className="grid gap-x-10 md:grid-cols-2">
          {items.map((a) => (
            <RowCard key={a.id} a={a} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Bookmark} title={emptyMsg[tab]} hint="Salve e curta matérias enquanto lê." />
      )}
    </div>
  );
}
