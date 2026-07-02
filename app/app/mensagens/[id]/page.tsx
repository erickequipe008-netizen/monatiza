"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, ImagePlus, X, Check, CheckCheck } from "lucide-react";
import { fetchMessages, sendMessage, markConversationRead, getProfileById, type DirectMessage } from "@/lib/premium/messages";
import { uploadMedia } from "@/lib/premium/upload";
import type { CommunityProfile } from "@/lib/premium/community";
import { Avatar } from "@/components/premium/PostCard";
import VerifiedBadge from "@/components/premium/VerifiedBadge";
import { Spinner } from "@/components/premium/States";
import { supabase } from "@/lib/supabase/client";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

// Deixa links clicáveis dentro da mensagem.
function linkify(text: string) {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-white/50 underline-offset-2 hover:decoration-white"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}

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
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const typingSentAt = useRef(0);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      markConversationRead(otherId);
    })();
    return () => {
      active = false;
    };
  }, [otherId]);

  // tempo real: novas mensagens + status de lido desta conversa
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
        // estou com a conversa aberta → marca como lida na hora
        if (m.sender_id === otherId) markConversationRead(otherId);
        setOtherTyping(false);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "direct_messages" }, (payload) => {
        const m = payload.new as DirectMessage;
        setMsgs((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: m.read } : x)));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [otherId, me]);

  // "digitando…" via broadcast (canal do par, sem tocar no banco)
  const typingChannel = useRef<ReturnType<typeof supabase.channel> | null>(null);
  useEffect(() => {
    if (!otherId || !me) return;
    const key = [me, otherId].sort().join("-");
    const ch = supabase
      .channel(`typing-${key}`)
      .on("broadcast", { event: "typing" }, (payload) => {
        if ((payload.payload as { who?: string })?.who !== me) {
          setOtherTyping(true);
          if (typingTimeout.current) clearTimeout(typingTimeout.current);
          typingTimeout.current = setTimeout(() => setOtherTyping(false), 2600);
        }
      })
      .subscribe();
    typingChannel.current = ch;
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingChannel.current = null;
      supabase.removeChannel(ch);
    };
  }, [otherId, me]);

  function broadcastTyping() {
    if (!me) return;
    const now = Date.now();
    if (now - typingSentAt.current < 1500) return;
    typingSentAt.current = now;
    typingChannel.current?.send({ type: "broadcast", event: "typing", payload: { who: me } });
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  async function send() {
    const t = text.trim();
    if ((!t && !imgFile) || sending) return;
    setSending(true);
    let imageUrl: string | null = null;
    if (imgFile) {
      const { url } = await uploadMedia(imgFile, "posts");
      imageUrl = url || null;
    }
    setText("");
    setImgFile(null);
    setImgPreview(null);
    if (fileRef.current) fileRef.current.value = "";
    const sent = await sendMessage(otherId, t, imageUrl);
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
        <Link href={other?.handle ? `/app/perfil/${other.handle}` : "#"} className="flex min-w-0 items-center gap-2.5">
          <Avatar name={name} url={other?.avatar_url} size={38} />
          <span className="min-w-0 leading-tight">
            <span className="flex items-center gap-1.5 font-bold text-white">
              <span className="truncate">{name}</span>
              {other?.verified && <VerifiedBadge size={14} />}
            </span>
            {otherTyping ? (
              <span className="pro-gradient-text block text-[12px] font-bold">digitando…</span>
            ) : (
              other?.handle && <span className="block truncate text-[12px] text-zinc-500">@{other.handle}</span>
            )}
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
                  {m.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.image_url} alt="" className="mb-1 max-h-64 rounded-lg" />
                  )}
                  {m.content && linkify(m.content)}
                  {mine && (
                    <span className="ml-1.5 inline-flex translate-y-[2px] align-baseline">
                      {m.read ? <CheckCheck size={13} className="text-white" /> : <Check size={13} className="text-white/60" />}
                    </span>
                  )}
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
      <div className="pt-3">
        {imgPreview && (
          <div className="relative mb-2 w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgPreview} alt="prévia" className="max-h-40 rounded-xl border border-white/10" />
            <button
              onClick={() => {
                setImgFile(null);
                setImgPreview(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-black"
              aria-label="Remover"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fileRef.current?.click()}
            className="shrink-0 rounded-full p-2.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Enviar foto"
          >
            <ImagePlus size={20} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setImgFile(f);
                setImgPreview(URL.createObjectURL(f));
              }
            }}
          />
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              broadcastTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Escreva uma mensagem…"
            className="pro-glass flex-1 rounded-full px-5 py-3.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-[#9B72CB]"
          />
          <button
            onClick={send}
            disabled={sending || (!text.trim() && !imgFile)}
            className="pro-gradient pro-glow inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition hover:opacity-90 active:scale-95 disabled:opacity-50"
            aria-label="Enviar"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
