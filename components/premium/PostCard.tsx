"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, MessageCircle, Trash2, Repeat2, X } from "lucide-react";
import { togglePostLike, deletePost, repost, type Post } from "@/lib/premium/community";
import { timeAgo } from "@/components/premium/PremiumCards";
import VerifiedBadge from "@/components/premium/VerifiedBadge";
import PostComposer from "@/components/premium/PostComposer";

export function Avatar({
  name,
  url,
  size = 40,
}: {
  name?: string | null;
  url?: string | null;
  size?: number;
}) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img src={url} alt={name || ""} className="rounded-full object-cover" style={{ width: size, height: size }} />
    );
  }
  const ch = (name || "?").charAt(0).toUpperCase();
  return (
    <span
      className="pro-gradient flex items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {ch}
    </span>
  );
}

// Deixa #hashtags clicáveis (levam à busca).
function renderContent(text: string) {
  return text.split(/(#[\p{L}0-9_]+)/gu).map((part, i) =>
    /^#/.test(part) ? (
      <Link
        key={i}
        href={`/app/busca?q=${encodeURIComponent(part)}`}
        onClick={(e) => e.stopPropagation()}
        className="text-[#9B72CB] hover:underline"
      >
        {part}
      </Link>
    ) : (
      part
    )
  );
}

// Card compacto da publicação citada.
function QuotedCard({ post }: { post: Post }) {
  const handle = post.author?.handle || "membro";
  const name = post.author?.display_name || handle;
  return (
    <div className="mt-2 rounded-xl border border-white/10 p-3 transition hover:bg-white/5">
      <div className="flex items-center gap-1.5 text-[13px]">
        <Avatar name={name} url={post.author?.avatar_url} size={18} />
        <span className="font-bold text-zinc-200">{name}</span>
        {post.author?.verified && <VerifiedBadge size={12} />}
        <span className="truncate text-zinc-500">@{handle}</span>
      </div>
      {post.content && <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-[14px] text-zinc-300">{post.content}</p>}
      {post.image_url && (
        <div className="mt-2 overflow-hidden rounded-lg border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image_url} alt="" className="max-h-64 w-full object-cover" />
        </div>
      )}
    </div>
  );
}

export default function PostCard({
  post,
  myId,
  onDeleted,
  clickable = true,
}: {
  post: Post;
  myId?: string | null;
  onDeleted?: (id: number) => void;
  clickable?: boolean;
}) {
  const router = useRouter();

  // Repost puro (sem texto/imagem próprios) → mostramos o original.
  const isPureRepost = !!post.repost_of && !post.content && !post.image_url && !!post.repostOf;
  const display = isPureRepost ? (post.repostOf as Post) : post;
  const quoted = !isPureRepost ? post.repostOf : null;

  const [liked, setLiked] = useState(display.likedByMe);
  const [count, setCount] = useState(display.likeCount);
  const [popped, setPopped] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [showQuote, setShowQuote] = useState(false);

  const isMine = !!myId && post.user_id === myId;
  const handle = display.author?.handle || "membro";
  const name = display.author?.display_name || handle;

  async function like(e: React.MouseEvent) {
    e.stopPropagation();
    const n = !liked;
    setLiked(n);
    setCount((c) => c + (n ? 1 : -1));
    if (n) {
      setPopped(true);
      setTimeout(() => setPopped(false), 320);
    }
    await togglePostLike(display.id, n);
  }
  async function del(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Excluir esta publicação?")) return;
    await deletePost(post.id);
    onDeleted?.(post.id);
  }
  async function doRepost(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuOpen(false);
    setReposted(true);
    await repost(display.id);
  }

  return (
    <article
      onClick={clickable ? () => router.push(`/app/comunidade/${display.id}`) : undefined}
      className={`relative flex gap-3 border-b border-white/10 px-1 py-4 ${clickable ? "cursor-pointer hover:bg-white/5" : ""}`}
    >
      <Link href={`/app/perfil/${handle}`} onClick={(e) => e.stopPropagation()} className="shrink-0">
        <Avatar name={name} url={display.author?.avatar_url} />
      </Link>
      <div className="min-w-0 flex-1">
        {isPureRepost && (
          <p className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold text-zinc-500">
            <Repeat2 size={13} /> {post.author?.display_name || post.author?.handle || "Alguém"} repostou
          </p>
        )}
        <div className="flex items-center gap-1.5 text-[14px]">
          <Link
            href={`/app/perfil/${handle}`}
            onClick={(e) => e.stopPropagation()}
            className="font-bold text-zinc-100 hover:underline"
          >
            {name}
          </Link>
          {display.author?.verified && <VerifiedBadge size={14} />}
          <span className="truncate text-zinc-400">@{handle}</span>
          <span className="text-zinc-300">·</span>
          <span className="shrink-0 text-zinc-400">{timeAgo(display.created_at)}</span>
          {isMine && (
            <button onClick={del} className="ml-auto shrink-0 text-zinc-600 hover:text-[#E0263B]" title="Excluir">
              <Trash2 size={15} />
            </button>
          )}
        </div>

        {display.content && (
          <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-zinc-200">
            {renderContent(display.content)}
          </p>
        )}
        {display.image_url && (
          <div className="mt-2 overflow-hidden rounded-xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={display.image_url} alt="" className="max-h-[520px] w-full object-cover" />
          </div>
        )}

        {quoted && (
          <Link href={`/app/comunidade/${quoted.id}`} onClick={(e) => e.stopPropagation()} className="block">
            <QuotedCard post={quoted} />
          </Link>
        )}

        <div className="-ml-2 mt-2 flex items-center gap-1 text-zinc-400">
          <span className="flex items-center gap-1 rounded-full px-2 py-1.5 text-[13px] transition hover:bg-[#9B72CB]/10 hover:text-[#9B72CB]">
            <MessageCircle size={18} />
            {display.replyCount > 0 && <span className="font-semibold">{display.replyCount}</span>}
          </span>

          {/* Repostar / Citar */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className={`flex items-center gap-1 rounded-full px-2 py-1.5 text-[13px] transition hover:bg-emerald-500/10 ${
                reposted ? "text-emerald-400" : "hover:text-emerald-400"
              }`}
              aria-label="Repostar"
            >
              <Repeat2 size={18} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                <div className="absolute left-0 z-50 mt-1 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#15151b] shadow-xl">
                  <button
                    onClick={doRepost}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] font-semibold text-zinc-200 hover:bg-white/5"
                  >
                    <Repeat2 size={15} /> Repostar
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setShowQuote(true); }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] font-semibold text-zinc-200 hover:bg-white/5"
                  >
                    <MessageCircle size={15} /> Citar publicação
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={like}
            className={`flex items-center gap-1 rounded-full px-2 py-1.5 text-[13px] transition hover:bg-[#E0263B]/10 ${
              liked ? "text-[#E0263B]" : "hover:text-[#E0263B]"
            }`}
            aria-label="Curtir"
          >
            <Heart
              size={18}
              fill={liked ? "currentColor" : "none"}
              style={popped ? { animation: "pro-pop 0.32s cubic-bezier(0.22,1,0.36,1)" } : undefined}
            />
            {count > 0 && <span className="font-semibold">{count}</span>}
          </button>
        </div>
      </div>

      {/* Modal de citação */}
      {showQuote && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-4 pt-20 backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); setShowQuote(false); }}
        >
          <div
            className="pro-pop w-full max-w-[560px] rounded-2xl border border-white/10 bg-[#0f0f14] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-bold text-zinc-300">Citar publicação</span>
              <button onClick={() => setShowQuote(false)} className="text-zinc-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <PostComposer
              quoteOf={display}
              placeholder="Adicione um comentário…"
              onPosted={() => {
                setShowQuote(false);
                setReposted(true);
              }}
            />
          </div>
        </div>
      )}
    </article>
  );
}
