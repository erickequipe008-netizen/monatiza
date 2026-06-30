"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Check, Lock, ShieldCheck, CreditCard, ArrowRight, Crown } from "lucide-react";

const PLAN: Record<string, { label: string; price: string; period: string; note: string }> = {
  mensal: { label: "MonatizaPlus Mensal", price: "R$ 19,90", period: "/mês", note: "Cobrança mensal, renovada automaticamente." },
  anual: { label: "MonatizaPlus Anual", price: "R$ 199", period: "/ano", note: "Cobrança anual (2 meses grátis), renovada automaticamente." },
};

function PagamentoInner() {
  const params = useSearchParams();
  const plano: "mensal" | "anual" = params.get("plano") === "anual" ? "anual" : "mensal";
  const info = PLAN[plano];

  const [ready, setReady] = useState(false);
  const [going, setGoing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = `/painel/login?next=${encodeURIComponent(`/assinar/pagamento?plano=${plano}`)}`;
        return;
      }
      setReady(true);
    })();
  }, [plano]);

  async function goToCheckout() {
    setGoing(true);
    setError("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = "/painel/login";
      return;
    }
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ plano }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        setError(json.error || "Não foi possível iniciar o pagamento. Tente novamente.");
        setGoing(false);
        return;
      }
      window.location.href = json.url;
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setGoing(false);
    }
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#08080b] text-white">
      <div className="pointer-events-none absolute -left-40 top-0 h-[460px] w-[560px] rounded-full bg-[#7C3AED]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[460px] w-[560px] rounded-full bg-[#FF2D87]/15 blur-[120px]" />

      {/* ── Resumo ── */}
      <div className="relative hidden w-[44%] flex-col justify-between border-r border-white/10 px-14 py-16 lg:flex">
        <div className="relative z-10">
          <span className="pro-gradient-text inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.3em]">
            <Crown size={14} /> MonatizaPlus
          </span>
          <h1 className="mt-8 max-w-sm text-5xl font-black leading-[1.1] tracking-tight">Quase lá.</h1>
          <p className="mt-4 max-w-xs text-sm text-zinc-400">{info.label}</p>
          <ul className="mt-8 max-w-xs space-y-3 text-sm text-zinc-300">
            {["Acesso ilimitado e sem anúncios", "Newsletter premium", "Revista Monatiza", "Comunidade e mensagens"].map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="pro-gradient mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                  <Check size={12} strokeWidth={3} className="text-white" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative z-10 flex items-center gap-4 border-t border-white/10 pt-6 text-xs text-zinc-500">
          <span className="uppercase tracking-[0.3em]">Cancele quando quiser</span>
          <span className="h-px flex-1 bg-white/10" />
          <span className="pro-gradient-text uppercase tracking-[0.3em]">monatiza</span>
        </div>
      </div>

      {/* ── Pagamento ── */}
      <div className="relative flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight">Pagamento</h2>
            <p className="text-sm text-zinc-400">Revise seu plano e conclua no ambiente seguro.</p>
          </div>

          {/* card do plano */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-black uppercase tracking-widest text-zinc-400">{info.label}</span>
              <span className="pro-gradient-text text-[22px] font-black">
                {info.price}
                <span className="text-[13px] font-bold text-zinc-500">{info.period}</span>
              </span>
            </div>
            <p className="mt-2 text-[12.5px] text-zinc-500">{info.note}</p>
          </div>

          {/* formas de pagamento */}
          <div className="flex items-center gap-2 text-[12px] text-zinc-400">
            <CreditCard size={15} className="text-zinc-500" />
            Cartão de crédito · Apple Pay · Google Pay
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
          )}

          <button
            onClick={goToCheckout}
            disabled={!ready || going}
            className="pro-gradient pro-glow flex h-13 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {going ? "Abrindo pagamento seguro…" : <>Ir para o pagamento seguro <ArrowRight size={16} /></>}
          </button>

          {/* textos de transparência (como será cobrado) */}
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-zinc-400">
              <ShieldCheck size={13} /> Como funciona a cobrança
            </p>
            <p className="text-[11.5px] leading-relaxed text-zinc-500">
              O pagamento é processado em ambiente seguro e criptografado — não armazenamos os dados
              do seu cartão. A assinatura
              {plano === "anual" ? " anual" : " mensal"} é renovada automaticamente e você pode
              cancelar quando quiser em <span className="text-zinc-300">Minha conta</span>. Ao
              continuar, você concorda com os{" "}
              <Link href="/termos" className="underline hover:text-zinc-300">Termos</Link> e a{" "}
              <Link href="/privacy" className="underline hover:text-zinc-300">Política de Privacidade</Link>.
            </p>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
            <Lock size={12} /> Pagamento 100% seguro e criptografado.
          </p>

          <Link href="/assinantes" className="block text-center text-sm font-semibold text-zinc-400 hover:text-white">
            ← Voltar aos planos
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function PagamentoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08080b]" />}>
      <PagamentoInner />
    </Suspense>
  );
}
