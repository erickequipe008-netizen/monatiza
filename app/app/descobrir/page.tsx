"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, TrendingUp } from "lucide-react";
import {
  getRecommendedProfiles,
  getTrendingHashtags,
  follow,
  unfollow,
  type CommunityProfile,
} from "@/lib/premium/community";
import { Avatar } from "@/components/premium/PostCard";
import VerifiedBadge from "@/components/premium/VerifiedBadge";
import { Spinner, EmptyState, PageHeader } from "@/components/premium/States";

function Row({ p }: { p: CommunityProfile }) {
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const n = !following;
    setFollowing(n);
    setBusy(true);
    if (n) await follow(p.user_id);
    else await unfollow(p.user_id);
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-3 border-b border-white/10 py-4">
      <Link href={`/app/perfil/${p.handle}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar name={p.display_name || p.handle} url={p.avatar_url} size={48} />
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate font-bold text-zinc-100">
            {p.display_name || p.handle}
            {p.verified && <VerifiedBadge size={13} />}
          </p>
          <p className="truncate text-[13px] text-zinc-500">@{p.handle}</p>
          {p.bio && <p className="line-clamp-1 text-[13px] text-zinc-500">{p.bio}</p>}
        </div>
      </Link>
      <button
        onClick={toggle}
        disabled={busy}
        className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-bold transition disabled:opacity-60 ${
          following ? "border border-white/15 text-zinc-200" : "pro-gradient text-white hover:opacity-90"
        }`}
      >
        {following ? "Seguindo" : "Seguir"}
      </button>
    </div>
  );
}

export default function DescobrirPage() {
  const [people, setPeople] = useState<CommunityProfile[]>([]);
  const [trends, setTrends] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, t] = await Promise.all([getRecommendedProfiles(40), getTrendingHashtags(8)]);
      setPeople(p);
      setTrends(t);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-[640px]">
      <PageHeader
        eyebrow={<><Compass size={14} /> Descobrir</>}
        title="Explorar"
        subtitle="Assuntos do momento e pessoas da comunidade para você seguir."
      />

      {trends.length > 0 && (
        <div className="mb-8">
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
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : people.length ? (
        <div>
          {people.map((p) => (
            <Row key={p.user_id} p={p} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Compass}
          title="Sem recomendações por enquanto."
          hint="Conforme mais assinantes entram na comunidade, eles aparecem aqui."
        />
      )}
    </div>
  );
}
