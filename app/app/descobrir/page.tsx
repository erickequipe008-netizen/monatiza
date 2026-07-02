"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, TrendingUp, Newspaper } from "lucide-react";
import { getTrendingHashtags } from "@/lib/premium/community";
import { fetchLatest, fetchByCategory, type ArticleCard } from "@/lib/premium/articles";
import { BigCard } from "@/components/premium/PremiumCards";
import { Spinner, EmptyState, PageHeader } from "@/components/premium/States";

const CATS = ["Todas", "Negócios", "IA", "Mercado", "Brasil", "Tech", "Empreende", "Startups", "Carreira", "Saúde"];

export default function ExplorarPage() {
  const [trends, setTrends] = useState<{ tag: string; count: number }[]>([]);
  const [cat, setCat] = useState("Todas");
  const [articles, setArticles] = useState<ArticleCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrendingHashtags(10).then(setTrends);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const data = cat === "Todas" ? await fetchLatest(24) : await fetchByCategory(`%${cat}%`, 24);
      if (active) {
        setArticles(data);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [cat]);

  return (
    <div className="mx-auto max-w-[980px]">
      <PageHeader
        eyebrow={<><Compass size={14} /> Explorar</>}
        title="Assuntos e artigos"
        subtitle="O que está em alta na comunidade e as reportagens para você conferir."
      />

      {/* Assuntos do momento */}
      {trends.length > 0 && (
        <section className="mb-9">
          <h2 className="mb-3 flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-zinc-500">
            <TrendingUp size={14} /> Assuntos do momento
          </h2>
          <div className="flex flex-wrap gap-2">
            {trends.map((t) => (
              <Link
                key={t.tag}
                href={`/app/busca?q=${encodeURIComponent(t.tag)}`}
                className="pro-glass rounded-full px-4 py-2 text-[13px] font-bold text-zinc-100"
              >
                {t.tag} <span className="ml-1 text-[11px] font-semibold text-zinc-500">{t.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Artigos */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-zinc-500">
            <Newspaper size={14} /> Artigos
          </h2>
        </div>

        <div className="pro-scroll mb-6 flex gap-2 overflow-x-auto pb-1">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition ${
                cat === c ? "pro-gradient text-white" : "bg-white/5 text-zinc-400 hover:bg-white/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner />
        ) : articles.length ? (
          <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <BigCard key={a.id} a={a} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Newspaper} title="Nada nesta categoria ainda." hint="Escolha outra categoria." />
        )}
      </section>
    </div>
  );
}
