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

function timeAgo(iso?: string | null) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "agora";
  if (s < 3600) return `${Math.floor(s / 60)}min`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return `${Math.floor(s / 604800)}sem`;
}

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
                    <span className="pro-ring rounded-full p-[2px] transition hover:scale-105">
                      <Avatar name={p.display_name || p.handle} url={p.avatar_url} size={54} />
                    </span>
                    <span className="w-full truncate text-center text-[11px] text-zinc-400">{(p.display_name || p.handle || "").split(" ")[0]}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {convs.length ? (
            <>
              <p className="mb-2 text-[12px] font-black uppercase tracking-widest text-zinc-500">Recentes</p>
              <div className="space-y-1">
                {convs.map((c) => {
                  const hasUnread = (c.unread ?? 0) > 0;
                  const name = c.profile?.display_name || c.profile?.handle || "Membro";
                  return (
                    <Link
                      key={c.other}
                      href={`/app/mensagens/${c.other}`}
                      className="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-white/[0.06]"
                    >
                      <span className={`rounded-full p-[2px] ${hasUnread ? "pro-ring" : ""}`}>
                        <Avatar name={name} url={c.profile?.avatar_url} size={52} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className={`truncate ${hasUnread ? "font-extrabold text-white" : "font-bold text-zinc-100"}`}>{name}</p>
                          {c.profile?.verified && <VerifiedBadge size={14} />}
                        </div>
                        <p className={`truncate text-[13px] ${hasUnread ? "text-zinc-100" : "text-zinc-500"}`}>
                          {c.fromMe && <span className="font-semibold text-zinc-400">Você: </span>}
                          {c.content}
                        </p>
                      </div>
                      <div className="ml-2 flex shrink-0 flex-col items-end gap-1.5">
                        <span className={`text-[11px] ${hasUnread ? "pro-gradient-text font-bold" : "text-zinc-500"}`}>
                          {timeAgo(c.created_at)}
                        </span>
                        {hasUnread ? (
                          <span className="pro-badge pro-gradient flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-extrabold text-white">
                            {c.unread! > 99 ? "99+" : c.unread}
                          </span>
                        ) : (
                          <span className="h-5" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
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
