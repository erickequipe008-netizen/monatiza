"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT, AD_SLOTS, type AdPlacement } from "@/lib/ads";

type AdSlotProps = {
  /** Posição definida em lib/ads.ts */
  placement: AdPlacement;
  /** Formato do anúncio. "horizontal" para faixas, "rectangle" para sidebar/in-feed. */
  format?: "auto" | "horizontal" | "rectangle" | "vertical";
  /** Altura mínima reservada (evita layout shift / CLS). */
  minHeight?: number;
  /** Classes extras no container. */
  className?: string;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Espaço de anúncio reservado, padronizado e responsivo.
 *
 * - Reserva a altura no layout para não causar "pulo" (bom para Core Web Vitals).
 * - Mostra um rótulo discreto "Publicidade", como nos grandes portais.
 * - Se o slot ainda não foi configurado em lib/ads.ts:
 *     • em desenvolvimento → mostra um espaço reservado tracejado;
 *     • em produção → não renderiza nada (sem caixas vazias).
 */
export default function AdSlot({
  placement,
  format = "auto",
  minHeight = 280,
  className = "",
}: AdSlotProps) {
  const slot = AD_SLOTS[placement];
  const pushed = useRef(false);

  useEffect(() => {
    if (!slot || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* AdSense ainda carregando — ignora silenciosamente */
    }
  }, [slot]);

  // Sem slot configurado.
  if (!slot) {
    if (process.env.NODE_ENV === "production") return null;
    return (
      <div
        className={`w-full flex items-center justify-center border border-dashed border-zinc-300 bg-zinc-50 text-[11px] uppercase tracking-widest text-zinc-400 ${className}`}
        style={{ minHeight }}
        aria-hidden="true"
      >
        Espaço reservado · {placement}
      </div>
    );
  }

  return (
    <div className={`w-full text-center ${className}`} style={{ minHeight }}>
      <span className="block text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-1 select-none">
        Publicidade
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: minHeight - 16 }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
