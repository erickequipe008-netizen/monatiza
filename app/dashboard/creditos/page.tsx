"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Check, Loader2, CreditCard } from "lucide-react";

const PACKAGES = [
  { credits: 1, price: "R$ 150", highlight: false },
  { credits: 3, price: "R$ 450", highlight: false },
  { credits: 5, price: "R$ 750", highlight: true },
  { credits: 10, price: "R$ 1.500", highlight: false },
];

function CreditosInner() {
  const params = useSearchParams();
  const justPaid = params.get("ok") === "1";

  const [balance, setBalance] = useState<number | null>(null);
  const [buying, setBuying] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: c } = await supabase
        .from("journalist_credits")
        .select("balance")
        .eq("journalist_id", user.id)
        .maybeSingle();
      setBalance(c?.balance ?? 0);
    })();
  }, []);

  async function buy(credits: number) {
    setBuying(credits);
    setError("");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      window.location.assign("/login");
      return;
    }
    const res = await fetch("/api/credits/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ credits }),
    });
    const json = await res.json();
    if (!res.ok || !json.url) {
      setError(json.error || "Não foi possível iniciar o pagamento.");
      setBuying(null);
      return;
    }
    window.location.assign(json.url);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#0b0b0c]">Créditos</h1>
          <p className="text-sm text-zinc-500 mt-1">Cada publicação BrandVoice consome 1 crédito (R$ 150 cada).</p>
        </div>
        <span className="text-sm text-zinc-600 bg-white border border-[#E8E6E1] px-4 py-2 rounded-full">
          Saldo atual: <strong className="text-[#0b0b0c]">{balance ?? "…"}</strong>
        </span>
      </div>

      {justPaid && (
        <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700 mb-5 flex items-center gap-2">
          <Check size={16} /> Pagamento recebido! Seus créditos são adicionados assim que o Stripe confirmar — recarregue em instantes.
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 mb-5">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PACKAGES.map((p) => (
          <div
            key={p.credits}
            className={`relative bg-white rounded-2xl p-6 border ${
              p.highlight ? "border-[#0b0b0c] shadow-lg" : "border-[#E8E6E1]"
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-6 bg-[#E0263B] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                Popular
              </span>
            )}
            <p className="text-[11px] uppercase tracking-[0.15em] text-zinc-400">Pacote</p>
            <p className="text-4xl font-black text-[#0b0b0c] mt-1">
              {p.credits}
              <span className="text-base font-semibold text-zinc-400"> créd.</span>
            </p>
            <p className="text-sm text-zinc-500 mt-1">{p.price}</p>
            <p className="text-xs text-zinc-400 mt-1">
              {p.credits} publicaç{p.credits > 1 ? "ões" : "ão"}
            </p>
            <button
              onClick={() => buy(p.credits)}
              disabled={buying !== null}
              className={`mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition disabled:opacity-50 ${
                p.highlight
                  ? "bg-[#0b0b0c] text-white hover:bg-[#E0263B]"
                  : "border border-[#0b0b0c] text-[#0b0b0c] hover:bg-[#0b0b0c] hover:text-white"
              }`}
            >
              {buying === p.credits ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
              {buying === p.credits ? "Indo ao pagamento…" : "Comprar"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function CreditosPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <CreditosInner />
    </Suspense>
  );
}
