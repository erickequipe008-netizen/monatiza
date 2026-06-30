"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { listConversations, type Conversation } from "@/lib/premium/messages";
import { listFollowing, type CommunityProfile } from "@/lib/premium/community";
import { Avatar } from "@/components/premium/PostCard";
import VerifiedBadge from "@/components/premium/VerifiedBadge";
import { Spinner, PageHeader, EmptyState } from "@/components/premium/States";
import { supabase } from "@/lib/supabase/client";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

export default function MensagensPage() {
  const { user } = useSubscriber();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [following, setFollowing] = useState<CommunityProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [c, f] = await Promise.all([
      listConversations(),
      user?.id ? listFollowing(user.id) : Promise.resolve([]),
    ]);
    setConvs(c);
    setFollowing(f);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  // tempo real: nova mensagem que me envolve → recarrega a lista
  useEffect(() => {
    if (!user?.id) return;
    const ch = supabase
      .channel("realtime-dm-list")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages" }, (payload) => {
        const m = payload.new as { sender_id: string; recipient_id: string };
        if (m.sender_id === user.id || m.recipient_id === user.id) load();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user?.id, load]);

  const convoIds = new Set(convs.map((c) => c.other));
  const startable = following.filter((p) => !convoIds.has(p.user_id));

  return (
    <div className="mx-auto max-w-[640px]">
      <PageHeader
        eyebrow={<><Mail size={14} /> Mensagens</>}
        title="Conversas"
        subtitle="Converse em privado com outros assinantes que você segue."
      />

      {loading ? (
        <Spinner />
      ) : (
        <>
          {startable.length > 0 && (
            <div className="mb-7">
              <p className="mb-3 text-[12px] font-black uppercase tracking-widest text-zinc-500">Iniciar conversa</p>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {startable.map((p) => (
                  <Link
                    key={p.user_id}
                    href={`/app/mensagens/${p.user_id}`}
                    className="flex w-16 shrink-0 flex-col items-center gap-1.5"
                  >
                    <span className="pro-ring rounded-full p-[2px]">
                      <Avatar name={p.display_name || p.handle} url={p.avatar_url} size={54} />
                    </span>
                    <span className="w-full truncate text-center text-[11px] text-zinc-400">{p.display_name || p.handle}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {convs.length ? (
            <div className="divide-y divide-white/5">
              {convs.map((c) => (
                <Link
                  key={c.other}
                  href={`/app/mensagens/${c.other}`}
                  className="flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-white/5"
                >
                  <Avatar name={c.profile?.display_name || c.profile?.handle} url={c.profile?.avatar_url} size={48} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-bold text-zinc-100">{c.profile?.display_name || c.profile?.handle || "Membro"}</p>
                      {c.profile?.verified && <VerifiedBadge size={14} />}
                    </div>
                    <p className="truncate text-[13px] text-zinc-500">{c.content}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : startable.length === 0 ? (
            <EmptyState
              icon={Mail}
              title="Nenhuma conversa ainda"
              hint="Abra o perfil de alguém e toque em Mensagem para começar."
            />
          ) : null}
        </>
      )}
    </div>
  );
}
