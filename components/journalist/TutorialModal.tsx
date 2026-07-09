"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const SEEN_KEY = "monatiza_tutorial_seen";
const VIDEO_ID = "5N66FpQBQwQ";

// Popup de boas-vindas do painel: tutorial em vídeo de como usar a ferramenta.
// Abre na primeira entrada e não volta a incomodar depois de fechado.
export default function TutorialModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) setOpen(true);
    } catch {
      /* sem localStorage, não mostra */
    }
  }, []);

  function close() {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignora */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Tutorial do painel"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E8E6E1]">
          <div>
            <p className="text-[15px] font-black text-[#0b0b0c] leading-tight">Bem-vindo(a) ao seu painel</p>
            <p className="text-xs text-zinc-500">Assista ao tutorial rápido de como publicar seus artigos.</p>
          </div>
          <button
            onClick={close}
            aria-label="Fechar tutorial"
            className="p-2 rounded-full text-zinc-400 hover:text-[#0b0b0c] hover:bg-zinc-100 transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="aspect-video bg-black">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?rel=0&modestbranding=1&color=white`}
            title="Tutorial do painel do colunista"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="px-5 py-3.5 text-right">
          <button
            onClick={close}
            className="rounded-xl bg-[#0b0b0c] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#E0263B] transition"
          >
            Começar a usar
          </button>
        </div>
      </div>
    </div>
  );
}
