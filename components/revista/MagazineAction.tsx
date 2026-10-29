"use client";

import { useState } from "react";
import { Loader2, Download } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useSubscriber } from "@/components/premium/SubscriberProvider";
import BuyButton from "@/components/revista/BuyButton";

type Props = {
  magazineId: string;
  size?: "sm" | "lg";
  /** "portal" = vermelho; "app" = azul→lilás no mobile. */
  tone?: "portal" | "app";
};

/**
 * Ação da revista: ASSINANTE ativo baixa grátis (incluído no MonatizaPlus);
 * visitante vê o botão de comprar (R$ 17,80).
 */
export default function MagazineAction({ magazineId, size = "lg", tone = "portal" }: Props) {
  const { loading, isSubscriber } = useSubscriber();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (loading) {
    return <div className={`animate-pulse rounded-full bg-zinc-100 ${size === "lg" ? "h-[52px] w-full" : "h-[34px] w-24"}`} />;
  }

  if (!isSubscriber) {
    return <BuyButton magazineId={magazineId} label={size === "sm" ? "Comprar" : "Comprar agora"} size={size} tone={tone} />;
  }

  async function download() {
    setBusy(true);
    setErr("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch("/api/revista/assinante", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token ?? ""}` },
        body: JSON.stringify({ magazineId }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (json.url) {
        window.location.href = json.url;
      } else {
        setErr(json.error || "Não foi possível baixar.");
        setBusy(false);
      }
    } catch {
      setErr("Falha de conexão. Tente novamente.");
      setBusy(false);
    }
  }

  const color = tone === "app" ? "bg-[#1d9bf0] hover:bg-[#1a8cd8]" : "bg-red-600 hover:bg-red-700";
  const dims = size === "lg" ? "w-full px-7 py-3.5 text-[15px]" : "px-4 py-2 text-[13px]";

  return (
    <div className={size === "lg" ? "w-full" : ""}>
      <button
        onClick={download}
        disabled={busy}
        className={`inline-flex items-center justify-center gap-2 rounded-full font-bold text-white transition active:scale-[0.98] disabled:opacity-60 ${color} ${dims}`}
      >
        {busy ? <Loader2 size={size === "lg" ? 18 : 15} className="animate-spin" /> : <Download size={size === "lg" ? 18 : 15} />}
        {busy ? "Abrindo…" : size === "sm" ? "Ler grátis" : "Ler / baixar grátis"}
      </button>
      {err && <p className="mt-2 text-center text-[12.5px] text-red-500">{err}</p>}
      {size === "lg" && !err && (
        <p className="mt-2 text-center text-[12px] text-zinc-400">Incluído no seu MonatizaPlus</p>
      )}
    </div>
  );
}
