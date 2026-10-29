"use client";

import { useId } from "react";

// Selo de verificado — borda serrilhada (estilo Instagram) + check branco.
// tier: "gold" (dourado, padrão) ou "silver" (prata).
export default function VerifiedBadge({
  size = 14,
  className = "",
  tier = "gold",
}: {
  size?: number;
  className?: string;
  tier?: "gold" | "silver" | string | null;
}) {
  const id = useId();
  const silver = tier === "silver";
  const stops = silver
    ? ["#F4F5F7", "#C7CCD4", "#9AA1AC"]
    : ["#E8CE8E", "#C6A052", "#A87B30"];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`inline-block shrink-0 ${className}`}
      role="img"
      aria-label={silver ? "Conta verificada (prata)" : "Conta verificada"}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={stops[0]} />
          <stop offset="55%" stopColor={stops[1]} />
          <stop offset="100%" stopColor={stops[2]} />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12z"
      />
      <path
        d="M8.3 12.4l2.7 2.7 5.1-5.4"
        fill="none"
        stroke={silver ? "#3f4650" : "#fff"}
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
