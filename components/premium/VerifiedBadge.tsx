"use client";

import { useId } from "react";

// Selo de verificado dourado — borda serrilhada (estilo Instagram) + check branco.
export default function VerifiedBadge({
  size = 14,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`inline-block shrink-0 ${className}`}
      role="img"
      aria-label="Conta verificada"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E8CE8E" />
          <stop offset="55%" stopColor="#C6A052" />
          <stop offset="100%" stopColor="#A87B30" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12z"
      />
      <path
        d="M8.3 12.4l2.7 2.7 5.1-5.4"
        fill="none"
        stroke="#fff"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
