"use client";

import { useId } from "react";

// Selo de verificado dourado (estilo Instagram/X), com gradiente.
export default function VerifiedBadge({
  size = 16,
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
          <stop offset="0%" stopColor="#F2D98C" />
          <stop offset="50%" stopColor="#C9A24B" />
          <stop offset="100%" stopColor="#A9792B" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12z"
      />
      <path fill="#fff" d="M10.09 16.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48z" />
    </svg>
  );
}
