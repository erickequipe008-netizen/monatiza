"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, X, Eye, Trash2, Loader2 } from "lucide-react";
import {
  listStoryGroups,
  createStory,
  markStoryViewed,
  listStoryViewers,
  deleteStory,
  type StoryGroup,
} from "@/lib/premium/stories";
import { uploadMedia } from "@/lib/premium/upload";
import { Avatar } from "@/components/premium/PostCard";
import VerifiedBadge from "@/components/premium/VerifiedBadge";
import { timeAgo } from "@/components/premium/PremiumCards";
import type { CommunityProfile } from "@/lib/premium/community";

const IMAGE_MS = 6000;

export default function StoriesBar() {
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(() => {
    listStoryGroups().then(setGroups);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function pick(f: File | null) {
    if (!f || uploading) return;
    const isVideo = f.type.startsWith("video/");
    if (!isVideo && !f.type.startsWith("image/")) return;
    setUploading(true);
    const { url } = await uploadMedia(f, "stories");
    if (url) {
      await createStory(url, isVideo ? "video" : "image");
      load();
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="mb-4">
      <div className="pro-scroll flex gap-4 overflow-x-auto pb-2">
        {/* criar story */}
        <button onClick={() => fileRef.current?.click()} className="flex w-[68px] shrink-0 flex-col items-center gap-1.5">
          <span className="relative flex h-[62px] w-[62px] items-center justify-center rounded-full border-2 border-dashed border-white/25 text-zinc-400 transition hover:border-[#9B72CB] hover:text-[#9B72CB]">
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={22} />}
          </span>
          <span className="text-[11px] text-zinc-400">Seu story</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0] || null)}
        />

        {groups.map((g, i) => (
          <button key={g.user.user_id} onClick={() => setOpen(i)} className="flex w-[68px] shrink-0 flex-col items-center gap-1.5">
            <span className={`rounded-full p-[2.5px] ${g.allViewed ? "bg-white/20" : "pro-ring"}`}>
              <span className="block rounded-full bg-[#0a0a0c] p-[2px]">
                <Avatar name={g.user.display_name || g.user.handle} url={g.user.avatar_url} size={54} />
              </span>
            </span>
            <span className="w-full truncate text-center text-[11px] text-zinc-300">
              {g.isMine ? "Você" : (g.user.display_name || g.user.handle || "").split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      {open !== null && groups[open] && (
        <StoryViewer
          groups={groups}
          start={open}
          onClose={() => {
            setOpen(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function StoryViewer({ groups, start, onClose }: { groups: StoryGroup[]; start: number; onClose: () => void }) {
  const [gi, setGi] = useState(start);
  const [si, setSi] = useState(0);
  const [progress, setProgress] = useState(0);
  const [viewers, setViewers] = useState<CommunityProfile[] | null>(null);

  const group = groups[gi];
  const story = group?.stories[si];
  const isVideo = story?.media_type === "video";

  const next = useCallback(() => {
    setViewers(null);
    if (group && si < group.stories.length - 1) {
      setSi((s) => s + 1);
    } else if (gi < groups.length - 1) {
      setGi((g) => g + 1);
      setSi(0);
    } else {
      onClose();
    }
  }, [si, gi, group, groups.length, onClose]);

  const prev = useCallback(() => {
    setViewers(null);
    if (si > 0) setSi((s) => s - 1);
    else if (gi > 0) {
      setGi((g) => g - 1);
      setSi(groups[gi - 1].stories.length - 1);
    }
  }, [si, gi, groups]);

  const nextRef = useRef(next);
  nextRef.current = next;

  // registra visualização
  useEffect(() => {
    if (story) markStoryViewed(story.id);
  }, [story?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // avanço automático para imagens
  useEffect(() => {
    if (!story || isVideo || viewers) return;
    setProgress(0);
    const startedAt = Date.now();
    const iv = window.setInterval(() => {
      const p = (Date.now() - startedAt) / IMAGE_MS;
      if (p >= 1) {
        window.clearInterval(iv);
        nextRef.current();
      } else {
        setProgress(p);
      }
    }, 50);
    return () => window.clearInterval(iv);
  }, [story?.id, isVideo, viewers]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!story || !group) return null;
  const name = group.user.display_name || group.user.handle || "Membro";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95" onClick={onClose}>
      <div
        className="relative h-full max-h-[92vh] w-full max-w-[430px] overflow-hidden bg-black sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* mídia */}
        {isVideo ? (
          <video
            key={story.id}
            src={story.media_url}
            autoPlay
            playsInline
            className="h-full w-full object-contain"
            onEnded={() => nextRef.current()}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration) setProgress(v.currentTime / v.duration);
            }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={story.id} src={story.media_url} alt="" className="h-full w-full object-contain" />
        )}

        {/* zonas de toque */}
        <button className="absolute inset-y-0 left-0 w-1/3" onClick={prev} aria-label="Anterior" />
        <button className="absolute inset-y-0 right-0 w-2/3" onClick={() => nextRef.current()} aria-label="Próximo" />

        {/* barras de progresso */}
        <div className="absolute inset-x-3 top-3 flex gap-1">
          {group.stories.map((s, i) => (
            <span key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
              <span
                className="block h-full rounded-full bg-white"
                style={{ width: i < si ? "100%" : i === si ? `${Math.min(progress * 100, 100)}%` : "0%" }}
              />
            </span>
          ))}
        </div>

        {/* topo: autor + fechar */}
        <div className="absolute inset-x-3 top-7 flex items-center gap-2.5">
          <Avatar name={name} url={group.user.avatar_url} size={34} />
          <span className="flex items-center gap-1.5 text-[14px] font-bold text-white drop-shadow">
            {name}
            {group.user.verified && <VerifiedBadge size={13} />}
          </span>
          <span className="text-[12px] text-white/70">{timeAgo(story.created_at)}</span>
          <button onClick={onClose} className="ml-auto rounded-full bg-black/40 p-2 text-white hover:bg-black/70" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        {/* rodapé (dono): quem viu + excluir */}
        {group.isMine && (
          <div className="absolute inset-x-3 bottom-4 flex items-center justify-between">
            <button
              onClick={async () => setViewers(await listStoryViewers(story.id))}
              className="flex items-center gap-1.5 rounded-full bg-black/50 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-black/70"
            >
              <Eye size={15} /> Visualizações
            </button>
            <button
              onClick={async () => {
                if (!confirm("Excluir este story?")) return;
                await deleteStory(story.id);
                onClose();
              }}
              className="rounded-full bg-black/50 p-2.5 text-white hover:bg-[#E0263B]"
              aria-label="Excluir story"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}

        {/* lista de quem viu */}
        {viewers && (
          <div className="absolute inset-x-0 bottom-0 max-h-[55%] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[#101014] p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[13px] font-black uppercase tracking-widest text-zinc-400">
                {viewers.length} visualiza{viewers.length === 1 ? "ção" : "ções"}
              </p>
              <button onClick={() => setViewers(null)} className="text-zinc-400 hover:text-white" aria-label="Fechar lista">
                <X size={16} />
              </button>
            </div>
            {viewers.length ? (
              viewers.map((v) => (
                <div key={v.user_id} className="flex items-center gap-3 py-2">
                  <Avatar name={v.display_name || v.handle} url={v.avatar_url} size={36} />
                  <span className="flex items-center gap-1.5 text-[14px] font-semibold text-zinc-100">
                    {v.display_name || v.handle}
                    {v.verified && <VerifiedBadge size={12} />}
                  </span>
                  <span className="text-[12px] text-zinc-500">@{v.handle}</span>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-zinc-500">Ninguém viu ainda.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
