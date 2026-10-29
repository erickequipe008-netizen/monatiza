"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Trash2, Repeat2, X, Bookmark, Flag, Play, Volume2, VolumeX, MoreHorizontal, UserPlus, UserMinus, Ban, CircleSlash } from "lucide-react";
import { togglePostLike, togglePostBookmark, reportPost, deletePost, repost, follow, unfollow, isFollowing, type Post } from "@/lib/premium/community";
import { logEvent } from "@/lib/premium/events";
import { muteUser, blockUser } from "@/lib/premium/prefs";
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

// URL de vídeo? (mp4/webm/mov subidos pelo composer)
function isVideoUrl(u?: string | null) {
  return !!u && /\.(mp4|webm|mov|m4v)($|\?)/i.test(u);
}

// Vídeo estilo X: autoplay mudo ao entrar na tela; toque ativa o som; tocar de novo pausa.
function PostVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);

  // Autoplay mudo quando o vídeo está visível; pausa ao sair da tela.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.6 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    const v = ref.current;
    if (!v) return;
    if (v.muted) {
      // 1º toque: ativa o som (e garante tocando)
      v.muted = false;
      if (v.paused) v.play().catch(() => {});
    } else if (v.paused) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }

  return (
    <div className="relative cursor-pointer bg-black" onClick={handleClick}>
      <video
        ref={ref}
        src={src}
        playsInline
        muted
        loop
        preload="metadata"
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
        className="max-h-[520px] w-full"
      />
      {/* indicador de som no canto (estilo X) */}
      <span className="pointer-events-none absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur">
        {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </span>
      {/* play discreto só quando pausado manualmente */}
      {paused && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur">
            <Play size={26} fill="currentColor" className="ml-0.5" />
          </span>
        </span>
      )}
    </div>
  );
}

// Deixa #hashtags (busca) e @menções (perfil) clicáveis.
function renderContent(text: string) {
  return text.split(/(#[\p{L}0-9_]+|@[A-Za-z0-9_]+)/gu).map((part, i) => {
    if (/^#/.test(part)) {
      return (
        <Link
          key={i}
          href={`/app/busca?q=${encodeURIComponent(part)}`}
          onClick={(e) => {
            e.stopPropagation();
            void logEvent("click_tag", { tags: [part.toLowerCase()] });
          }}
          className="text-[#1d9bf0]"
        >
          {part}
        </Link>
      );
    }
    if (/^@/.test(part)) {
      return (
        <Link
          key={i}
          href={`/app/perfil/${part.slice(1).toLowerCase()}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[#1d9bf0]"
        >
          {part}
        </Link>
      );
    }
    return part;
  });
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
        {post.author?.verified && <VerifiedBadge size={12} tier={post.author?.verified_tier} />}
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
  const [saved, setSaved] = useState(display.bookmarkedByMe ?? false);
  const [popped, setPopped] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuFollowing, setMenuFollowing] = useState<boolean | null>(null);

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
      void logEvent("like_post", { text: display.content, targetUser: display.user_id });
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
  async function toggleSave(e: React.MouseEvent) {
    e.stopPropagation();
    const n = !saved;
    setSaved(n);
    await togglePostBookmark(display.id, n);
  }
  async function doReport(e: React.MouseEvent) {
    e.stopPropagation();
    const reason = prompt("Por que você quer denunciar esta publicação? (opcional)");
    if (reason === null) return;
    const ok = await reportPost(display.id, reason);
    alert(ok ? "Denúncia enviada. Nossa equipe vai analisar." : "Não foi possível enviar. Tente novamente.");
  }
  function notInterested(e: React.MouseEvent) {
    e.stopPropagation();
    setMoreOpen(false);
    void logEvent("not_interested", { text: display.content, targetUser: display.user_id });
    onDeleted?.(post.id);
  }
  async function toggleFollowAuthor(e: React.MouseEvent) {
    e.stopPropagation();
    setMoreOpen(false);
    const willFollow = !menuFollowing;
    setMenuFollowing(willFollow);
    if (willFollow) await follow(display.user_id);
    else await unfollow(display.user_id);
  }
  function doMute(e: React.MouseEvent) {
    e.stopPropagation();
    setMoreOpen(false);
    muteUser(display.user_id);
    onDeleted?.(post.id);
  }
  function doBlock(e: React.MouseEvent) {
    e.stopPropagation();
    setMoreOpen(false);
    blockUser(display.user_id);
    void unfollow(display.user_id);
    onDeleted?.(post.id);
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
            className="font-bold text-zinc-100"
          >
            {name}
          </Link>
          {display.author?.verified && <VerifiedBadge size={14} tier={display.author?.verified_tier} />}
          <span className="truncate text-zinc-400">@{handle}</span>
          <span className="text-zinc-300">·</span>
          <span className="shrink-0 text-zinc-400">{timeAgo(display.created_at)}</span>
          <div className="relative ml-auto shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMoreOpen((v) => !v);
                if (!isMine && menuFollowing === null) isFollowing(display.user_id).then(setMenuFollowing);
              }}
              className="rounded-full p-1.5 text-zinc-500 transition hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0]"
              aria-label="Mais opções"
            >
              <MoreHorizontal size={17} />
            </button>
            {moreOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMoreOpen(false); }} />
                <div className="absolute right-0 z-50 mt-1 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#16181c] py-1 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)]">
                  <button onClick={notInterested} className="flex w-full items-center gap-3 px-4 py-3 text-left text-[14px] font-bold text-zinc-100 transition hover:bg-white/5">
                    <CircleSlash size={17} className="shrink-0" /> Não tenho interesse
                  </button>
                  {!isMine && (
                    <button onClick={toggleFollowAuthor} className="flex w-full items-center gap-3 px-4 py-3 text-left text-[14px] font-bold text-zinc-100 transition hover:bg-white/5">
                      {menuFollowing ? <UserMinus size={17} className="shrink-0" /> : <UserPlus size={17} className="shrink-0" />}
                      <span className="truncate">{menuFollowing ? `Deixar de seguir @${handle}` : `Seguir @${handle}`}</span>
                    </button>
                  )}
                  {!isMine && (
                    <button onClick={doMute} className="flex w-full items-center gap-3 px-4 py-3 text-left text-[14px] font-bold text-zinc-100 transition hover:bg-white/5">
                      <VolumeX size={17} className="shrink-0" /> <span className="truncate">Silenciar @{handle}</span>
                    </button>
                  )}
                  {!isMine && (
                    <button onClick={doBlock} className="flex w-full items-center gap-3 px-4 py-3 text-left text-[14px] font-bold text-zinc-100 transition hover:bg-white/5">
                      <Ban size={17} className="shrink-0" /> <span className="truncate">Bloquear @{handle}</span>
                    </button>
                  )}
                  {!isMine && (
                    <button onClick={(e) => { setMoreOpen(false); doReport(e); }} className="flex w-full items-center gap-3 px-4 py-3 text-left text-[14px] font-bold text-zinc-100 transition hover:bg-white/5">
                      <Flag size={17} className="shrink-0" /> Denunciar publicação
                    </button>
                  )}
                  {isMine && (
                    <button onClick={(e) => { setMoreOpen(false); del(e); }} className="flex w-full items-center gap-3 px-4 py-3 text-left text-[14px] font-bold text-[#E0263B] transition hover:bg-[#E0263B]/10">
                      <Trash2 size={17} className="shrink-0" /> Excluir
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {display.content && (
          <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-zinc-200">
            {renderContent(display.content)}
          </p>
        )}
        {display.image_url && (
          <div className="mt-2 overflow-hidden rounded-xl border border-white/10" onClick={(e) => e.stopPropagation()}>
            {isVideoUrl(display.image_url) ? (
              <PostVideo src={display.image_url} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={display.image_url} alt="" className="max-h-[520px] w-full object-cover" />
            )}
          </div>
        )}

        {quoted && (
          <Link href={`/app/comunidade/${quoted.id}`} onClick={(e) => e.stopPropagation()} className="block">
            <QuotedCard post={quoted} />
          </Link>
        )}

        <div className="-ml-2 mt-2 flex items-center gap-1 text-zinc-400">
          <span className="flex items-center gap-1 rounded-full px-2 py-1.5 text-[13px] transition hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0]">
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

          <button
            onClick={toggleSave}
            className={`flex items-center gap-1 rounded-full px-2 py-1.5 text-[13px] transition hover:bg-[#1d9bf0]/10 ${
              saved ? "text-[#1d9bf0]" : "hover:text-[#1d9bf0]"
            }`}
            aria-label="Salvar"
          >
            <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
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
