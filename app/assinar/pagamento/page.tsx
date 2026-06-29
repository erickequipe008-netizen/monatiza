"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import { CheckoutElementsProvider, useCheckout, PaymentElement } from "@stripe/react-stripe-js/checkout";
import { supabase } from "@/lib/supabase/client";
import { Check, Lock } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

// Aparência editorial do Payment Element (preto/vermelho Monatiza).
const appearance: Appearance = {
  theme: "flat",
  variables: {
    colorPrimary: "#E0263B",
    colorBackground: "#ffffff",
    colorText: "#0b0b0c",
    colorDanger: "#E0263B",
    fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
};

const PLAN_LABEL: Record<string, string> = {
  mensal: "Plano Digital · cobrança mensal",
  anual: "Plano Anual · cobrança anual",
};

function PaymentForm() {
  const checkoutState = useCheckout();
  const [paying, setPaying] = useState(false);
  const [msg, setMsg] = useState("");

  if (checkoutState.type === "loading") {
    return <p className="text-sm text-zinc-400">Carregando pagamento…</p>;
  }
  if (checkoutState.type === "error") {
    return <p className="text-sm text-red-600">{checkoutState.error.message}</p>;
  }

  const checkout = checkoutState.checkout;
  const total = checkout.total.total.amount;

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setPaying(true);
    setMsg("");
    const result = await checkout.confirm({
      returnUrl: `${window.location.origin}/painel?sucesso=1`,
    });
    if (result.type === "error") {
      setMsg(result.error.message);
      setPaying(false);
    }
    // sucesso → o Stripe redireciona para o returnUrl
  }

  return (
    <form onSubmit={handlePay} className="space-y-5">
      {/* Apple Pay / Google Pay aparecem aqui automaticamente (carteira do aparelho)
          quando habilitados no painel do Stripe e o domínio estiver verificado. */}
      <PaymentElement options={{ wallets: { applePay: "auto", googlePay: "auto" } }} />
      {msg && (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{msg}</p>
      )}
      <button
        type="submit"
        disabled={paying}
        className="w-full h-13 rounded-2xl bg-[#111] text-white text-sm font-semibold transition hover:bg-[#E0263B] disabled:opacity-60"
      >
        {paying ? "Processando…" : `Pagar ${total}`}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
        <Lock size={12} /> Pagamento seguro processado pelo Stripe.
      </p>
    </form>
  );
}

function PagamentoInner() {
  const params = useSearchParams();
  const plano: "mensal" | "anual" = params.get("plano") === "anual" ? "anual" : "mensal";

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/painel/login";
        return;
      }
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plano }),
      });
      const json = await res.json();
      if (!res.ok || !json.clientSecret) {
        setError(json.error || "Não foi possível iniciar o pagamento.");
        return;
      }
      setClientSecret(json.clientSecret);
    })();
  }, [plano]);

  return (
    <main className="min-h-screen flex bg-white">
      {/* ── Lado editorial / resumo ── */}
      <div className="hidden lg:flex lg:w-[44%] relative flex-col justify-between bg-[#0b0b0c] text-white px-14 py-16 overflow-hidden">
        <span className="pointer-events-none select-none absolute -top-10 -left-6 text-[#E0263B]/15 font-serif text-[420px] leading-none">
          {"“"}
        </span>
        <div className="relative z-10">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#E0263B]">
            Monatiza · Assinatura
          </span>
          <h1 className="mt-8 font-serif text-5xl leading-[1.15] font-bold max-w-sm">
            Quase lá.
          </h1>
          <p className="mt-4 text-sm text-white/60 max-w-xs">{PLAN_LABEL[plano]}</p>
          <ul className="mt-8 space-y-3 text-sm text-white/70 max-w-xs">
            {["Acesso ilimitado e sem anúncios", "Newsletter premium", "Acesso à Revista Monatiza", "Conteúdo exclusivo de assinante"].map(
              (b) => (
                <li key={b} className="flex items-start gap-3">
                  <Check size={18} className="text-[#E0263B] shrink-0 mt-[1px]" strokeWidth={3} />
                  {b}
                </li>
              )
            )}
          </ul>
        </div>
        <div className="relative z-10 flex items-center gap-4 border-t border-white/10 pt-6 text-xs text-white/40">
          <span className="uppercase tracking-[0.3em]">Cancele quando quiser</span>
          <span className="h-px flex-1 bg-white/10" />
          <span className="uppercase tracking-[0.3em]">Monatiza</span>
        </div>
      </div>

      {/* ── Lado pagamento ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-[#111]">Pagamento</h2>
            <p className="text-sm text-gray-500">Preencha os dados do cartão para concluir.</p>
          </div>

          {error ? (
            <div className="space-y-4">
              <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
              <Link href="/assinantes" className="text-sm font-semibold text-[#111] hover:text-[#E0263B]">
                ← Voltar aos planos
              </Link>
            </div>
          ) : !clientSecret ? (
            <p className="text-sm text-zinc-400">Iniciando pagamento…</p>
          ) : (
            <CheckoutElementsProvider
              stripe={stripePromise}
              options={{ clientSecret, elementsOptions: { appearance } }}
            >
              <PaymentForm />
            </CheckoutElementsProvider>
          )}
        </div>
      </div>
    </main>
  );
}

export default function PagamentoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <PagamentoInner />
    </Suspense>
  );
}
