"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { fetchPremium, type ArticleCard } from "@/lib/premium/articles";
import { BigCard } from "@/components/premium/PremiumCards";
import { Spinner, EmptyState, PageHeader } from "@/components/premium/States";

export default function ExclusivoPage() {
  const [items, setItems] = useState<ArticleCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setItems(await fetchPremium(48));
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow={<><Sparkles size={14} /> Conteúdo exclusivo</>}
        title="Só para assinantes"
        subtitle="Análises, séries, entrevistas e reportagens especiais — com profundidade e sem anúncios."
      />
      {loading ? (
        <Spinner />
      ) : items.length ? (
        <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <BigCard key={a.id} a={a} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="Nenhum conteúdo exclusivo publicado ainda."
          hint="Marque matérias como “Premium” no editor para que apareçam aqui."
        />
      )}
    </div>
  );
}
