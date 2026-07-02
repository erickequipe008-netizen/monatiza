"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Heart, MessageCircle, Repeat2, UserPlus, Mail, AtSign } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { listNotifications, type AppNotification } from "@/lib/premium/notifications";
import { Avatar } from "@/components/premium/PostCard";
import VerifiedBadge from "@/components/premium/VerifiedBadge";
import { Spinner, PageHeader, EmptyState } from "@/components/premium/States";
import { timeAgo } from "@/components/premium/PremiumCards";

const META: Record<string, { icon: LucideIcon; text: string }> = {
  like: { icon: Heart, text: "curtiu sua publicação" },
  comment: { icon: MessageCircle, text: "comentou sua publicação" },
  repost: { icon: Repeat2, text: "repostou sua publicação" },
  follow: { icon: UserPlus, text: "começou a seguir você" },
  message: { icon: Mail, text: "te enviou uma mensagem" },
  mention: { icon: AtSign, text: "mencionou você em uma publicação" },
};

function hrefFor(n: AppNotification): string {
  if (n.type === "follow") return n.actor?.handle ? `/app/perfil/${n.actor.handle}` : "#";
  if (n.type === "message") return n.actor_id ? `/app/mensagens/${n.actor_id}` : "#";
  return n.post_id ? `/app/comunidade/${n.post_id}` : "#";
}

export default function NotificacoesPage() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listNotifications().then((d) => {
      setItems(d);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-[640px]">
      <PageHeader
        eyebrow={<><Bell size={14} /> Notificações</>}
        title="Atividade"
        subtitle="Curtidas, comentários, novos seguidores e mensagens."
      />

      {loading ? (
        <Spinner />
      ) : items.length ? (
        <div className="divide-y divide-white/5">
          {items.map((n) => {
            const meta = META[n.type] || { icon: Bell, text: "interagiu com você" };
            const Icon = meta.icon;
            const name = n.actor?.display_name || n.actor?.handle || "Alguém";
            return (
              <Link
                key={n.id}
                href={hrefFor(n)}
                className={`flex items-center gap-3 rounded-xl px-2 py-3.5 transition hover:bg-white/5 ${!n.read ? "bg-white/[0.03]" : ""}`}
              >
                <span className="pro-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white">
                  <Icon size={15} />
                </span>
                <Avatar name={name} url={n.actor?.avatar_url} size={38} />
                <div className="min-w-0 flex-1 text-[14px]">
                  <span className="font-bold text-zinc-100">{name}</span>
                  {n.actor?.verified && <span className="ml-1 inline-block align-middle"><VerifiedBadge size={13} /></span>}
                  <span className="text-zinc-400"> {meta.text}</span>
                </div>
                <span className="shrink-0 text-[12px] text-zinc-500">{timeAgo(n.created_at)}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Bell} title="Sem novidades por aqui" hint="Curtidas, comentários e seguidores aparecem aqui." />
      )}
    </div>
  );
}
