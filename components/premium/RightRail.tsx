"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  getRecommendedProfiles,
  getTrendingHashtags,
  follow,
  unfollow,
  type CommunityProfile,
} from "@/lib/premium/community";
import { fetchLatest, type ArticleCard } from "@/lib/premium/articles";
import { Avatar } from "@/components/premium/PostCard";
import VerifiedBadge from "@/components/premium/VerifiedBadge";
import { useLang } from "@/components/premium/useLang";

function FollowBtn({ userId }: { userId: string }) {
  const { t } = useLang();
  const [on, setOn] = useState(false);
  return (
    <button
      onClick={async () => {
        const n = !on;
        setOn(n);
        if (n) await follow(userId);
        else await unfollow(userId);
      }}
      className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-bold transition ${
        on ? "border border-white/20 text-zinc-200 hover:border-[#E0263B] hover:text-[#E0263B]" : "bg-white text-black hover:bg-white/90"
      }`}
    >
      {on ? t("following_btn") : t("follow")}
    </button>
  );
}

// Coluna da direita estilo X: Buscar + Quem seguir + Assuntos do momento.
export default function RightRail({ className = "" }: { className?: string }) {
  const router = useRouter();
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [people, setPeople] = useState<CommunityProfile[]>([]);
  const [trends, setTrends] = useState<{ tag: string; count: number }[]>([]);
  const [news, setNews] = useState<ArticleCard[]>([]);

  useEffect(() => {
    getRecommendedProfiles(3).then(setPeople);
    getTrendingHashtags(6).then(setTrends);
    fetchLatest(4).then(setNews);
  }, []);

  return (
    <aside className={className}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) router.push(`/app/busca?q=${encodeURIComponent(q.trim())}`);
        }}
        className="relative mb-4"
      >
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search")}
          className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-[14px] text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#1d9bf0]"
        />
      </form>

      {people.length > 0 && (
        <section className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <h2 className="px-4 pb-1 pt-3 text-[18px] font-extrabold text-white">{t("who_to_follow")}</h2>
          <div>
            {people.map((p) => (
              <div key={p.user_id} className="flex items-center gap-3 px-4 py-3 transition hover:bg-white/5">
                <Link href={`/app/perfil/${p.handle}`} className="flex min-w-0 flex-1 items-center gap-2.5">
                  <Avatar name={p.display_name || p.handle} url={p.avatar_url} size={40} />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 truncate text-[14px] font-bold text-zinc-100">
                      {p.display_name || p.handle}
                      {p.verified && <VerifiedBadge size={12} tier={p.verified_tier} />}
                    </span>
                    <span className="block truncate text-[13px] text-zinc-500">@{p.handle}</span>
                  </span>
                </Link>
                <FollowBtn userId={p.user_id} />
              </div>
            ))}
          </div>
          <Link href="/app/descobrir" className="block px-4 py-3 text-[13px] text-[#1d9bf0] transition hover:bg-white/5">
            {t("show_more")}
          </Link>
        </section>
      )}

      {trends.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <h2 className="px-4 pb-1 pt-3 text-[18px] font-extrabold text-white">{t("trending")}</h2>
          <div className="pb-2">
            {trends.map((tr) => (
              <Link key={tr.tag} href={`/app/busca?q=${encodeURIComponent(tr.tag)}`} className="block px-4 py-2 transition hover:bg-white/5">
                <p className="text-[14px] font-bold text-zinc-100">{tr.tag}</p>
                <p className="text-[12px] text-zinc-500">{tr.count} {t("posts_word")}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {news.length > 0 && (
        <section className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <h2 className="px-4 pb-1 pt-3 text-[18px] font-extrabold text-white">{t("news")}</h2>
          <div className="pb-1">
            {news.map((a) => (
              <Link key={a.id} href={`/app/ler/${a.slug}`} className="flex gap-3 px-4 py-2.5 transition hover:bg-white/5">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#1d9bf0]">{a.category || "Notícia"}</p>
                  <h3 className="mt-0.5 line-clamp-2 text-[13.5px] font-bold leading-snug text-zinc-100">{a.title}</h3>
                </div>
                {a.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.image_url} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                )}
              </Link>
            ))}
          </div>
          <Link href="/app/feed" className="block px-4 py-3 text-[13px] text-[#1d9bf0] transition hover:bg-white/5">
            {t("show_more")}
          </Link>
        </section>
      )}
    </aside>
  );
}
