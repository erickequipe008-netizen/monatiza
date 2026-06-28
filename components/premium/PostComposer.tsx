"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { createPost, type Post } from "@/lib/premium/community";
import { uploadMedia } from "@/lib/premium/upload";
import { Avatar } from "@/components/premium/PostCard";

const MAX = 500;

export default function PostComposer({
  parentId = null,
  placeholder = "Compartilhe sua opinião…",
  onPosted,
  myProfile,
}: {
  parentId?: number | null;
  placeholder?: string;
  onPosted: (p: Post) => void;
  myProfile?: { display_name?: string | null; avatar_url?: string | null } | null;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  function pickImage(f: File | null) {
    setErr("");
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErr("Selecione uma imagem.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function clearImage() {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit() {
    const t = text.trim();
    if ((!t && !file) || busy) return;
    setBusy(true);
    setErr("");
    let imageUrl: string | null = null;
    if (file) {
      const { url, error } = await uploadMedia(file, "posts");
      if (error || !url) {
        setErr("Não foi possível enviar a imagem.");
        setBusy(false);
        return;
      }
      imageUrl = url;
    }
    const p = await createPost(t, parentId, imageUrl);
    setBusy(false);
    if (p) {
      setText("");
      clearImage();
      onPosted(p);
    }
  }

  return (
    <div className="flex gap-3 border-b border-zinc-200 px-1 py-4">
      <Avatar name={myProfile?.display_name} url={myProfile?.avatar_url} />
      <div className="flex-1">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          placeholder={placeholder}
          rows={parentId ? 2 : 3}
          className="w-full resize-none border-0 bg-transparent text-[16px] leading-relaxed outline-none placeholder:text-zinc-400"
        />

        {preview && (
          <div className="relative mt-1 w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="prévia" className="max-h-72 rounded-xl border border-zinc-200" />
            <button
              onClick={clearImage}
              className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-black"
              aria-label="Remover imagem"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {err && <p className="mt-1 text-[12px] text-[#E0263B]">{err}</p>}

        <div className="mt-2 flex items-center justify-between gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-semibold text-[#E0263B] hover:bg-[#E0263B]/10"
          >
            <ImagePlus size={18} /> Foto
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickImage(e.target.files?.[0] || null)}
          />
          <div className="flex items-center gap-3">
            <span className={`text-[12px] ${text.length > MAX - 50 ? "text-[#E0263B]" : "text-zinc-400"}`}>
              {text.length}/{MAX}
            </span>
            <button
              onClick={submit}
              disabled={(!text.trim() && !file) || busy}
              className="pro-gradient inline-flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-bold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {busy && <Loader2 size={14} className="animate-spin" />}
              {busy ? "Enviando…" : parentId ? "Responder" : "Publicar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
