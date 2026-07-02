"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ARTICLE_LIST_COLUMNS } from "@/lib/articleFields";
import type { ArticleCard } from "@/lib/premium/articles";
import { searchProfiles, searchPosts, type CommunityProfile, type Post } from "@/lib/premium/community";
import { RowCard } from "@/components/premium/PremiumCards";
import PostCard, { Avatar } from "@/components/premium/PostCard";
import VerifiedBadge from "@/components/premium/VerifiedBadge";
import { Spinner, EmptyState, PageHeader } from "@/components/premium/States";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

function BuscaInner() {
  const sp = useSearchParams();
  const { user } = useSubscriber();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [people, setPeople] = useState<CommunityProfile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [articles, setArticles] = useState<ArticleCard[]>([]);
  const [searched, setSearched] = useState(false);

  const runTerm = useCallback(async (raw: string) => {
    const term = raw.trim().replace(/[,()*%]/g, " ").trim();
    if (!term) return;
    setLoading(true);
    setSearched(true);
    const [pe, po, arts] = await Promise.all([
      searchProfiles(term),
      searchPosts(term),
      supabase
        .from("articles")
        .select(ARTICLE_LIST_COLUMNS)
        .eq("status", "publicado")
        .or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);
    setPeople(pe);
    setPosts(po);
    setArticles((arts.data as ArticleCard[]) || []);
    setLoading(false);
  }, []);

  // termo inicial vindo da URL (ex.: clique numa #hashtag)
  useEffect(() => {
    const initial = sp.get("q");
    if (initial) {
      setQ(initial);
      runTerm(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const empty = !people.length && !posts.length && !articles.length;

  return (
    <div>
      <PageHeader eyebrow={<><Search size={14} /> Busca</>} title="Buscar" subtitle="Pessoas, publicações, #hashtags e notícias." />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runTerm(q);
        }}
        className="relative mb-8 max-w-xl"
      >
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
          placeholder="Buscar pessoas, #assuntos ou notícias…"
          className="w-full rounded-full border border-white/10 bg-white/5 py-3.5 pl-12 pr-28 text-[15px] text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#9B72CB]"
        />
        <button
          type="submit"
          className="pro-gradient absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full px-5 py-2 text-sm font-bold text-white hover:opacity-90"
        >
          Buscar
        </button>
      </form>

      {loading ? (
        <Spinner />
      ) : !searched ? (
        <p className="text-sm text-zinc-400">Busque por pessoas, assuntos com #hashtag ou notícias.</p>
      ) : empty ? (
        <EmptyState icon={Search} title="Nada encontrado." hint="Tente outras palavras." />
      ) : (
        <div className="space-y-10">
          {people.length > 0 && (
            <section>
              <h2 className="mb-3 text-[12px] font-black uppercase tracking-widest text-zinc-500">Pessoas</h2>
              <div className="divide-y divide-white/5">
                {people.map((p) => (
                  <Link
                    key={p.user_id}
                    href={`/app/perfil/${p.handle}`}
                    className="flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-white/5"
                  >
                    <Avatar name={p.display_name || p.handle} url={p.avatar_url} size={46} />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 truncate font-bold text-zinc-100">
                        {p.display_name || p.handle}
                        {p.verified && <VerifiedBadge size={13} />}
                      </p>
                      <p className="truncate text-[13px] text-zinc-500">@{p.handle}</p>
                      {p.bio && <p className="line-clamp-1 text-[13px] text-zinc-500">{p.bio}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {posts.length > 0 && (
            <section>
              <h2 className="mb-3 text-[12px] font-black uppercase tracking-widest text-zinc-500">Publicações</h2>
              {posts.map((p) => (
                <PostCard key={p.id} post={p} myId={user?.id} />
              ))}
            </section>
          )}

          {articles.length > 0 && (
            <section>
              <h2 className="mb-3 text-[12px] font-black uppercase tracking-widest text-zinc-500">Notícias</h2>
              <div className="grid gap-x-10 md:grid-cols-2">
                {articles.map((a) => (
                  <RowCard key={a.id} a={a} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function BuscaPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <BuscaInner />
    </Suspense>
  );
}
