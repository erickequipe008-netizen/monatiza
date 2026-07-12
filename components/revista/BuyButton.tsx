"use client";

import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";

type Props = {
  magazineId: string;
  label?: string;
  size?: "sm" | "lg";
  className?: string;
};

/** Botão "Comprar agora" — abre o Checkout do Stripe. */
export default function BuyButton({ magazineId, label = "Comprar agora", size = "lg", className = "" }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function buy() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/magazine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ magazineId }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (json.url) {
        window.location.href = json.url;
      } else {
        setError(json.error || "Não foi possível iniciar o pagamento.");
        setLoading(false);
      }
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full bg-[#6D28D9] font-bold text-white transition hover:bg-[#5b21b6] active:scale-[0.98] disabled:opacity-60";
  const dims = size === "lg" ? "px-7 py-3.5 text-[15px]" : "px-4 py-2 text-[13px]";

  return (
    <div className={size === "lg" ? "w-full" : ""}>
      <button onClick={buy} disabled={loading} className={`${base} ${dims} ${size === "lg" ? "w-full" : ""} ${className}`}>
        {loading ? <Loader2 size={size === "lg" ? 18 : 15} className="animate-spin" /> : <ShoppingBag size={size === "lg" ? 18 : 15} />}
        {loading ? "Abrindo…" : label}
      </button>
      {error && <p className="mt-2 text-center text-[12.5px] text-red-500">{error}</p>}
    </div>
  );
}
