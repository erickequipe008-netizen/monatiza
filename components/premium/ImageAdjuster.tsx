"use client";

import { useEffect, useRef, useState } from "react";
import { ZoomIn, Loader2 } from "lucide-react";

// Reposicionar/enquadrar imagem antes de salvar (estilo Facebook):
// arrastar para posicionar + zoom, exporta JPEG no tamanho alvo.
export default function ImageAdjuster({
  file,
  outW,
  outH,
  round = false,
  busy = false,
  onCancel,
  onDone,
}: {
  file: File;
  outW: number;
  outH: number;
  round?: boolean;
  busy?: boolean;
  onCancel: () => void;
  onDone: (blob: Blob) => void;
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
    const s = Math.max(frame.width / img.w, frame.height / img.h) * z;
    const maxX = Math.max(0, (img.w * s - frame.width) / 2);
    const maxY = Math.max(0, (img.h * s - frame.height) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, x)), y: Math.min(maxY, Math.max(-maxY, y)) };
  }

  const frame = frameRef.current?.getBoundingClientRect();
  const scale = frame && img ? Math.max(frame.width / img.w, frame.height / img.h) * zoom : 1;

  function publish() {
    const el = imgElRef.current;
    const fr = frameRef.current?.getBoundingClientRect();
    if (!el || !fr || !img) return;
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const k = outW / fr.width;
    const s = Math.max(fr.width / img.w, fr.height / img.h) * zoom;
    const dw = img.w * s * k;
    const dh = img.h * s * k;
    const dx = (outW - dw) / 2 + off.x * k;
    const dy = (outH - dh) / 2 + off.y * k;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, outW, outH);
    ctx.drawImage(el, dx, dy, dw, dh);
    canvas.toBlob((b) => b && onDone(b), "image/jpeg", 0.9);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4" onClick={onCancel}>
      <div className="pro-pop w-full max-w-[420px]" onClick={(e) => e.stopPropagation()}>
        <p className="mb-3 text-center text-[13px] font-black uppercase tracking-widest text-zinc-400">
          Ajuste o enquadramento
        </p>

        <div
          ref={frameRef}
          className={`relative mx-auto w-full touch-none select-none overflow-hidden bg-black ring-1 ring-white/20 ${
            round ? "aspect-square max-w-[280px] rounded-full" : "aspect-[10/3] rounded-2xl"
          }`}
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            drag.current = { px: e.clientX, py: e.clientY, ox: off.x, oy: off.y };
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            setOff(clampOff(drag.current.ox + (e.clientX - drag.current.px), drag.current.oy + (e.clientY - drag.current.py), zoom));
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
            onChange={(e) => {
              const z = Number(e.target.value);
              setZoom(z);
              setOff((o) => clampOff(o.x, o.y, z));
            }}
            className="w-full accent-[#9B72CB]"
            aria-label="Zoom"
          />
        </div>
        <p className="mt-1 text-center text-[11px] text-zinc-500">Arraste para posicionar e ajuste o zoom</p>

        <div className="mt-4 flex gap-3">
          <button onClick={onCancel} className="pro-glass flex-1 rounded-2xl py-3.5 text-sm font-bold text-zinc-200">
            Cancelar
          </button>
          <button
            onClick={publish}
            disabled={busy || !img}
            className="pro-gradient pro-glow flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {busy && <Loader2 size={15} className="animate-spin" />} Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
