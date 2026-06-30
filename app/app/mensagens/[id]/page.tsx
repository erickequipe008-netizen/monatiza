"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { fetchMessages, sendMessage, getProfileById, type DirectMessage } from "@/lib/premium/messages";
import type { CommunityProfile } from "@/lib/premium/community";
import { Avatar } from "@/components/premium/PostCard";
import VerifiedBadge from "@/components/premium/VerifiedBadge";
import { Spinner } from "@/components/premium/States";
import { supabase } from "@/lib/supabase/client";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const otherId = (params?.id as string) || "";
  const { user } = useSubscriber();
  const me = user?.id;
  const [other, setOther] = useState<CommunityProfile | null>(null);
  const [msgs, setMsgs] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!otherId) return;
    let active = true;
    (async () => {
      setLoading(true);
      const [p, m] = await Promise.all([getProfileById(otherId), fetchMessages(otherId)]);
      if (!active) return;
      setOther(p);
      setMsgs(m);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [otherId]);

  // tempo real: novas mensagens desta conversa
  useEffect(() => {
    if (!otherId || !me) return;
    const ch = supabase
      .channel(`dm-${otherId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages" }, (payload) => {
        const m = payload.new as DirectMessage;
        const involved =
          (m.sender_id === me && m.recipient_id === otherId) ||
          (m.sender_id === otherId && m.recipient_id === me);
        if (!involved) return;
        setMsgs((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [otherId, me]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  async function send() {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    setText("");
    const sent = await sendMessage(otherId, t);
    if (sent) setMsgs((prev) => (prev.some((x) => x.id === sent.id) ? prev : [...prev, sent]));
    setSending(false);
  }

  const name = other?.display_name || other?.handle || "Membro";

  return (
    <div className="mx-auto flex h-[calc(100dvh-7.5rem)] max-w-[640px] flex-col">
      {/* topo */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <Link href="/app/mensagens" className="text-zinc-400 transition hover:text-white">
          <ArrowLeft size={18} />
        </Link>
        <Link href={other?.handle ? `/app/perfil/${other.handle}` : "#"} className="flex items-center gap-2.5">
          <Avatar name={name} url={other?.avatar_url} size={36} />
          <span className="flex items-center gap-1.5 font-bold text-white">
            {name}
            {other?.verified && <VerifiedBadge size={14} />}
          </span>
        </Link>
      </div>

      {/* mensagens */}
      <div className="flex-1 space-y-2 overflow-y-auto py-4">
        {loading ? (
          <Spinner />
        ) : msgs.length ? (
          msgs.map((m) => {
            const mine = m.sender_id === me;
            return (
              <div key={m.id} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                {!mine && <Avatar name={name} url={other?.avatar_url} size={26} />}
                <div
                  className={`max-w-[74%] px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${
                    mine
                      ? "pro-gradient rounded-2xl rounded-br-md text-white"
                      : "rounded-2xl rounded-bl-md bg-white/10 text-zinc-100"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-10 text-center text-sm text-zinc-500">Diga olá 👋</p>
        )}
        <div ref={endRef} />
      </div>

      {/* compositor */}
      <div className="flex items-center gap-2.5 pt-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Escreva uma mensagem…"
          className="pro-glass flex-1 rounded-full px-5 py-3.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-[#9B72CB]"
        />
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          className="pro-gradient pro-glow inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition hover:opacity-90 active:scale-95 disabled:opacity-50"
          aria-label="Enviar"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}
