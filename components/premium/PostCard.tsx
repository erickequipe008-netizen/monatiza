"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { togglePostLike, deletePost, type Post } from "@/lib/premium/community";
import { timeAgo } from "@/components/premium/PremiumCards";

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
      <img
        src={url}
        alt={name || ""}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
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
  const [liked, setLiked] = useState(post.likedByMe);
  const [count, setCount] = useState(post.likeCount);
  const [popped, setPopped] = useState(false);
  const isMine = !!myId && post.user_id === myId;
  const handle = post.author?.handle || "membro";
  const name = post.author?.display_name || handle;

  async function like(e: React.MouseEvent) {
    e.stopPropagation();
    const n = !liked;
    setLiked(n);
    setCount((c) => c + (n ? 1 : -1));
    if (n) {
      setPopped(true);
      setTimeout(() => setPopped(false), 320);
    }
    await togglePostLike(post.id, n);
  }
  async function del(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Excluir esta publicação?")) return;
    await deletePost(post.id);
    onDeleted?.(post.id);
  }

  return (
    <article
      onClick={clickable ? () => router.push(`/app/comunidade/${post.id}`) : undefined}
      className={`flex gap-3 border-b border-zinc-200/70 px-1 py-4 ${
        clickable ? "cursor-pointer hover:bg-zinc-50/70" : ""
      }`}
    >
      <Link href={`/app/perfil/${handle}`} onClick={(e) => e.stopPropagation()} className="shrink-0">
        <Avatar name={name} url={post.author?.avatar_url} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[14px]">
          <Link
            href={`/app/perfil/${handle}`}
            onClick={(e) => e.stopPropagation()}
            className="font-bold text-[#0b0b0c] hover:underline"
          >
            {name}
          </Link>
          <span className="truncate text-zinc-400">@{handle}</span>
          <span className="text-zinc-300">·</span>
          <span className="shrink-0 text-zinc-400">{timeAgo(post.created_at)}</span>
          {isMine && (
            <button onClick={del} className="ml-auto shrink-0 text-zinc-300 hover:text-[#E0263B]" title="Excluir">
              <Trash2 size={15} />
            </button>
          )}
        </div>
        {post.content && (
          <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-zinc-800">
            {post.content}
          </p>
        )}
        {post.image_url && (
          <div className="mt-2 overflow-hidden rounded-xl border border-zinc-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.image_url} alt="" className="max-h-[520px] w-full object-cover" />
          </div>
        )}
        <div className="-ml-2 mt-2 flex items-center gap-1 text-zinc-400">
          <span className="flex items-center gap-1 rounded-full px-2 py-1.5 text-[13px] transition hover:bg-[#9B72CB]/10 hover:text-[#9B72CB]">
            <MessageCircle size={18} />
            {post.replyCount > 0 && <span className="font-semibold">{post.replyCount}</span>}
          </span>
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
    </article>
  );
}
