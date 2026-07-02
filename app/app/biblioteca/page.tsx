"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import {
  getSaved,
  getLiked,
  getHistory,
  getContinueReading,
} from "@/lib/premium/library";
import { listSavedPosts, type Post } from "@/lib/premium/community";
import type { ArticleCard } from "@/lib/premium/articles";
import { RowCard } from "@/components/premium/PremiumCards";
import PostCard from "@/components/premium/PostCard";
import { Spinner, EmptyState, PageHeader } from "@/components/premium/States";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

const TABS = [
  { key: "continue", label: "Continuar lendo" },
  { key: "saved", label: "Salvos" },
  { key: "liked", label: "Curtidos" },
  { key: "history", label: "Histórico" },
  { key: "posts", label: "Publicações salvas" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function BibliotecaPage() {
  const { user } = useSubscriber();
  const [tab, setTab] = useState<TabKey>("continue");
  const [items, setItems] = useState<ArticleCard[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      if (tab === "posts") {
        const d = await listSavedPosts();
        if (active) {
          setPosts(d);
          setLoading(false);
        }
        return;
      }
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
    posts: "As publicações que você salvar na comunidade aparecem aqui.",
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
              tab === t.key ? "pro-gradient text-white" : "bg-white/5 text-zinc-400 hover:bg-white/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : tab === "posts" ? (
        posts.length ? (
          <div className="mx-auto max-w-[640px]">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} myId={user?.id} />
            ))}
          </div>
        ) : (
          <EmptyState icon={Bookmark} title={emptyMsg[tab]} hint="Toque no ícone de salvar em uma publicação." />
        )
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
