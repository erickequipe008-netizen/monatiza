"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass } from "lucide-react";
import {
  getRecommendedProfiles,
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
            {p.verified && <VerifiedBadge size={14} />}
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setPeople(await getRecommendedProfiles(40));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-[640px]">
      <PageHeader
        eyebrow={<><Compass size={14} /> Descobrir</>}
        title="Perfis recomendados"
        subtitle="Pessoas da comunidade Monatiza para você seguir."
      />
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
