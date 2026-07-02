"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, X, Eye, Trash2, Loader2, ImagePlus, Type, ZoomIn } from "lucide-react";
import {
  listStoryGroups,
  createStory,
  createTextStory,
  markStoryViewed,
  listStoryViewers,
  deleteStory,
  storyBgCss,
  STORY_BGS,
  type StoryGroup,
} from "@/lib/premium/stories";
import { uploadMedia } from "@/lib/premium/upload";
import { Avatar } from "@/components/premium/PostCard";
import VerifiedBadge from "@/components/premium/VerifiedBadge";
import { timeAgo } from "@/components/premium/PremiumCards";
import type { CommunityProfile } from "@/lib/premium/community";

const IMAGE_MS = 6000;
const OUT_W = 1080;
const OUT_H = 1920;

// ── Editor de enquadramento (estilo Instagram): zoom + arrastar ──
// Sempre exporta JPEG 1080×1920, aceito pelo storage em qualquer aparelho.
function StoryImageEditor({
  file,
  onCancel,
  onPublish,
  busy,
}: {
  file: File;
  onCancel: () => void;
  onPublish: (blob: Blob) => void;
  busy: boolean;
}) {
  const [url] = useState(() => URL.createObjectURL(file));
  const [img, setImg] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const frameRef = useRef<HTMLDivElement | null>(null);
  const imgElRef = useRef<HTMLImageElement | null>(null);
  const drag = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  function clampOff(x: number, y: number, z: number) {
    const frame = frameRef.current?.getBoundingClientRect();
    if (!frame || !img) return { x, y };
    const scale = Math.max(frame.width / img.w, frame.height / img.h) * z;
    const maxX = Math.max(0, (img.w * scale - frame.width) / 2);
    const maxY = Math.max(0, (img.h * scale - frame.height) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, x)), y: Math.min(maxY, Math.max(-maxY, y)) };
  }

  function setZoomClamped(z: number) {
    setZoom(z);
    setOff((o) => clampOff(o.x, o.y, z));
  }

  const frame = frameRef.current?.getBoundingClientRect();
  const scale = frame && img ? Math.max(frame.width / img.w, frame.height / img.h) * zoom : 1;

  async function publish() {
    const el = imgElRef.current;
    const fr = frameRef.current?.getBoundingClientRect();
    if (!el || !fr || !img) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUT_W;
    canvas.height = OUT_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const k = OUT_W / fr.width; // frame → canvas
    const s = Math.max(fr.width / img.w, fr.height / img.h) * zoom;
    const dw = img.w * s * k;
    const dh = img.h * s * k;
    const dx = (OUT_W - dw) / 2 + off.x * k;
    const dy = (OUT_H - dh) / 2 + off.y * k;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, OUT_W, OUT_H);
    ctx.drawImage(el, dx, dy, dw, dh);
    canvas.toBlob((blob) => blob && onPublish(blob), "image/jpeg", 0.9);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4" onClick={onCancel}>
      <div className="pro-pop w-full max-w-[360px]" onClick={(e) => e.stopPropagation()}>
        <p className="mb-3 text-center text-[13px] font-black uppercase tracking-widest text-zinc-400">
          Ajuste o enquadramento
        </p>

        <div
          ref={frameRef}
          className="relative mx-auto aspect-[9/16] w-full touch-none select-none overflow-hidden rounded-2xl bg-black ring-1 ring-white/20"
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            drag.current = { px: e.clientX, py: e.clientY, ox: off.x, oy: off.y };
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            const nx = drag.current.ox + (e.clientX - drag.current.px);
            const ny = drag.current.oy + (e.clientY - drag.current.py);
            setOff(clampOff(nx, ny, zoom));
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgElRef}
            src={url}
            alt=""
            draggable={false}
            onLoad={(e) => setImg({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
            style={
              img
                ? {
                    width: img.w * scale,
                    height: img.h * scale,
                    transform: `translate(calc(-50% + ${off.x}px), calc(-50% + ${off.y}px))`,
                  }
                : { opacity: 0 }
            }
          />
        </div>

        <div className="mt-4 flex items-center gap-3 px-1">
          <ZoomIn size={16} className="shrink-0 text-zinc-400" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoomClamped(Number(e.target.value))}
            className="w-full accent-[#9B72CB]"
            aria-label="Zoom"
          />
        </div>
        <p className="mt-1 text-center text-[11px] text-zinc-500">Arraste para posicionar · publicado em 1080×1920</p>

        <div className="mt-4 flex gap-3">
          <button
            onClick={onCancel}
            className="pro-glass flex-1 rounded-2xl py-3.5 text-sm font-bold text-zinc-200"
          >
            Cancelar
          </button>
          <button
            onClick={publish}
            disabled={busy || !img}
            className="pro-gradient pro-glow flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {busy && <Loader2 size={15} className="animate-spin" />} Publicar
          </button>
        </div>
      </div>
    </div>
  );
}

// Botão reutilizável de criar story: Foto/Vídeo (com editor) ou Texto.
export function AddStoryButton({
  className = "",
  children,
  onCreated,
}: {
  className?: string;
  children: React.ReactNode;
  onCreated?: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const [textOpen, setTextOpen] = useState(false);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [bg, setBg] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  function closeAll() {
    setMenu(false);
    setTextOpen(false);
    setEditFile(null);
    setErr("");
  }

  async function pick(f: File | null) {
    if (!f || busy) return;
    setErr("");
    if (f.type.startsWith("video/")) {
      // vídeo: sobe direto (sem recorte no navegador)
      setBusy(true);
      const { url, error } = await uploadMedia(f, "stories");
      if (url) {
        await createStory(url, "video");
        onCreated?.();
        closeAll();
      } else {
        setErr(error || "Não foi possível enviar o vídeo.");
      }
      setBusy(false);
    } else if (f.type.startsWith("image/")) {
      setEditFile(f); // abre o editor de enquadramento
    } else {
      setErr("Escolha uma imagem ou um vídeo.");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function publishEdited(blob: Blob) {
    setBusy(true);
    setErr("");
    const jpg = new File([blob], `story-${Date.now()}.jpg`, { type: "image/jpeg" });
    const { url, error } = await uploadMedia(jpg, "stories");
    if (url) {
      await createStory(url, "image");
      onCreated?.();
      closeAll();
    } else {
      setErr(error || "Não foi possível publicar. Tente novamente.");
    }
    setBusy(false);
  }

  async function publishText() {
    if (!text.trim() || busy) return;
    setBusy(true);
    const ok = await createTextStory(text, STORY_BGS[bg].key);
    setBusy(false);
    if (ok) {
      setText("");
      onCreated?.();
      closeAll();
    }
  }

  return (
    <>
      <button onClick={() => setMenu(true)} className={className} aria-label="Adicionar story">
        {busy && !editFile ? <Loader2 size={16} className="animate-spin" /> : children}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0] || null)}
      />

      {menu && !editFile && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center" onClick={closeAll}>
          <div
            className="pro-pop w-full max-w-[420px] rounded-t-3xl border border-white/10 bg-[#101014] p-5 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            {!textOpen ? (
              <>
                <p className="mb-4 text-center text-[13px] font-black uppercase tracking-widest text-zinc-400">Novo story</p>
                {err && <p className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-[12.5px] text-red-300">{err}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="pro-glass flex flex-col items-center gap-2 rounded-2xl py-6 text-zinc-100"
                  >
                    <ImagePlus size={26} className="text-[#9B72CB]" />
                    <span className="text-[13px] font-bold">Foto ou vídeo</span>
                  </button>
                  <button
                    onClick={() => setTextOpen(true)}
                    className="pro-glass flex flex-col items-center gap-2 rounded-2xl py-6 text-zinc-100"
                  >
                    <Type size={26} className="text-[#FF5C8A]" />
                    <span className="text-[13px] font-bold">Texto</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[13px] font-black uppercase tracking-widest text-zinc-400">Story de texto</p>
                  <button onClick={() => setTextOpen(false)} className="text-zinc-400 hover:text-white" aria-label="Voltar">
                    <X size={16} />
                  </button>
                </div>
                <div
                  className="flex min-h-[180px] items-center justify-center rounded-2xl p-5"
                  style={{ background: STORY_BGS[bg].css }}
                >
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, 280))}
                    placeholder="Escreva algo…"
                    rows={3}
                    autoFocus
                    className="w-full resize-none border-0 bg-transparent text-center text-[20px] font-extrabold leading-snug text-white outline-none placeholder:text-white/60"
                  />
                </div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  {STORY_BGS.map((b, i) => (
                    <button
                      key={b.key}
                      onClick={() => setBg(i)}
                      className={`h-7 w-7 rounded-full transition ${bg === i ? "ring-2 ring-white" : "opacity-70"}`}
                      style={{ background: b.css }}
                      aria-label={`Fundo ${b.key}`}
                    />
                  ))}
                </div>
                <button
                  onClick={publishText}
                  disabled={!text.trim() || busy}
                  className="pro-gradient pro-glow mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {busy && <Loader2 size={15} className="animate-spin" />} Publicar no story
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {editFile && (
        <StoryImageEditor
          file={editFile}
          busy={busy}
          onCancel={() => {
            setEditFile(null);
            setErr("");
          }}
          onPublish={publishEdited}
        />
      )}
    </>
  );
}

export default function StoriesBar() {
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [open, setOpen] = useState<number | null>(null);

  const load = useCallback(() => {
    listStoryGroups().then(setGroups);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mb-4">
      <div className="pro-scroll flex gap-4 overflow-x-auto pb-2">
        {/* criar story */}
        <div className="flex w-[68px] shrink-0 flex-col items-center gap-1.5">
          <AddStoryButton
            onCreated={load}
            className="relative flex h-[62px] w-[62px] items-center justify-center rounded-full border-2 border-dashed border-white/25 text-zinc-400 transition hover:border-[#9B72CB] hover:text-[#9B72CB]"
          >
            <Plus size={22} />
          </AddStoryButton>
          <span className="text-[11px] text-zinc-400">Seu story</span>
        </div>

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
  const isText = story?.media_type === "text";

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

  useEffect(() => {
    if (story) markStoryViewed(story.id);
  }, [story?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
        {isText ? (
          <div
            key={story.id}
            className="flex h-full w-full items-center justify-center p-8"
            style={{ background: storyBgCss(story.bg) }}
          >
            <p className="text-center text-[26px] font-extrabold leading-snug text-white drop-shadow">
              {story.text_content}
            </p>
          </div>
        ) : isVideo ? (
          <video
            key={story.id}
            src={story.media_url || undefined}
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
          // imagens já saem do editor em 1080×1920 → tela cheia
          // eslint-disable-next-line @next/next/no-img-element
          <img key={story.id} src={story.media_url || ""} alt="" className="h-full w-full object-cover" />
        )}

        <button className="absolute inset-y-0 left-0 w-1/3" onClick={prev} aria-label="Anterior" />
        <button className="absolute inset-y-0 right-0 w-2/3" onClick={() => nextRef.current()} aria-label="Próximo" />

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
