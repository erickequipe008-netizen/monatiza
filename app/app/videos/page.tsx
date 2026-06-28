"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Video, Heart, Plus, X, Loader2, Volume2, VolumeX, Trash2 } from "lucide-react";
import { listReels, createReel, deleteReel, toggleReelLike, type Reel } from "@/lib/premium/reels";
import { uploadMedia } from "@/lib/premium/upload";
import { Avatar } from "@/components/premium/PostCard";
import { Spinner, EmptyState, PageHeader } from "@/components/premium/States";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

function ReelItem({
  reel,
  myId,
  muted,
  onToggleMute,
  onDeleted,
}: {
  reel: Reel;
  myId?: string | null;
  muted: boolean;
  onToggleMute: () => void;
  onDeleted: (id: number) => void;
}) {
  const vref = useRef<HTMLVideoElement | null>(null);
  const [liked, setLiked] = useState(reel.likedByMe);
  const [count, setCount] = useState(reel.likeCount);

  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        });
      },
      { threshold: 0.6 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  async function like() {
    const n = !liked;
    setLiked(n);
    setCount((c) => c + (n ? 1 : -1));
    await toggleReelLike(reel.id, n);
  }

  const handle = reel.author?.handle || "membro";
  const name = reel.author?.display_name || handle;

  return (
    <div className="flex h-full snap-start items-center justify-center py-2">
      <div className="relative aspect-[9/16] h-full max-h-[78vh] overflow-hidden rounded-3xl bg-black">
        <video
          ref={vref}
          src={reel.video_url}
          loop
          muted={muted}
          playsInline
          className="h-full w-full object-cover"
          onClick={(e) => {
            const v = e.currentTarget;
            v.paused ? v.play() : v.pause();
          }}
        />
        <button
          onClick={onToggleMute}
          className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white"
          aria-label={muted ? "Ativar som" : "Silenciar"}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-5 text-white">
          <Link
            href={`/app/perfil/${handle}`}
            className="pointer-events-auto inline-flex items-center gap-2"
          >
            <Avatar name={name} url={reel.author?.avatar_url} size={36} />
            <span className="font-bold">{name}</span>
            <span className="text-[13px] text-white/60">@{handle}</span>
          </Link>
          {reel.caption && <p className="mt-2 max-w-[80%] text-[14px] leading-relaxed">{reel.caption}</p>}
        </div>

        <div className="absolute bottom-24 right-3 flex flex-col items-center gap-5 text-white">
          <button onClick={like} className="flex flex-col items-center">
            <Heart size={30} fill={liked ? "#E0263B" : "none"} className={liked ? "text-[#E0263B]" : ""} />
            <span className="text-xs font-semibold">{count}</span>
          </button>
          {myId === reel.user_id && (
            <button
              onClick={async () => {
                if (confirm("Excluir este vídeo?")) {
                  await deleteReel(reel.id);
                  onDeleted(reel.id);
                }
              }}
              aria-label="Excluir"
            >
              <Trash2 size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (r: Reel) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function publish() {
    if (!file) {
      setErr("Selecione um vídeo.");
      return;
    }
    setBusy(true);
    setErr("");
    const { url, error } = await uploadMedia(file, "reels");
    if (error || !url) {
      setErr("Falha ao enviar o vídeo. Verifique o tamanho (até 75 MB).");
      setBusy(false);
      return;
    }
    const r = await createReel(url, caption);
    setBusy(false);
    if (r) onCreated(r);
    else setErr("Não foi possível publicar.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black">Novo vídeo</h2>
          <button onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[#0b0b0c] file:px-4 file:py-2 file:text-white"
        />
        {file && <p className="mt-2 truncate text-xs text-zinc-500">{file.name}</p>}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value.slice(0, 300))}
          rows={3}
          placeholder="Legenda…"
          className="mt-3 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-zinc-400"
        />
        {err && <p className="mt-2 text-sm text-[#E0263B]">{err}</p>}
        <button
          onClick={publish}
          disabled={busy || !file}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b0b0c] py-3 text-sm font-bold text-white transition hover:bg-[#E0263B] disabled:opacity-50"
        >
          {busy && <Loader2 size={14} className="animate-spin" />}
          {busy ? "Enviando…" : "Publicar vídeo"}
        </button>
        <p className="mt-2 text-center text-[11px] text-zinc-400">MP4 ou WebM, até 75 MB.</p>
      </div>
    </div>
  );
}

export default function VideosPage() {
  const { user } = useSubscriber();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    (async () => {
      setReels(await listReels(20));
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-4">
        <PageHeader eyebrow={<><Video size={14} /> Vídeos</>} title="Reels" />
        <button
          onClick={() => setShowUpload(true)}
          className="mb-1 inline-flex items-center gap-2 rounded-full bg-[#E0263B] px-4 py-2 text-[13px] font-bold text-white transition hover:bg-[#b91d2f]"
        >
          <Plus size={16} /> Novo vídeo
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : reels.length ? (
        <div className="h-[calc(100vh-12rem)] snap-y snap-mandatory overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {reels.map((r) => (
            <ReelItem
              key={r.id}
              reel={r}
              myId={user?.id}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)}
              onDeleted={(id) => setReels((prev) => prev.filter((x) => x.id !== id))}
            />
          ))}
        </div>
      ) : (
        <EmptyState icon={Video} title="Nenhum vídeo ainda." hint="Toque em “Novo vídeo” e poste o primeiro Reel." />
      )}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onCreated={(r) => {
            setReels((prev) => [r, ...prev]);
            setShowUpload(false);
          }}
        />
      )}
    </div>
  );
}
