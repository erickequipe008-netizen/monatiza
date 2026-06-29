"use client";

import { useId } from "react";

// Selo de verificado dourado — versão minimalista (círculo limpo + check).
export default function VerifiedBadge({
  size = 15,
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
          <stop offset="0%" stopColor="#E3CC92" />
          <stop offset="100%" stopColor="#B8923F" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill={`url(#${id})`} />
      <path
        d="M8.4 12.4l2.3 2.3 4.9-5.1"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
