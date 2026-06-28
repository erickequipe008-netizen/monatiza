"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, LogOut, Crown, Check } from "lucide-react";
import { useSubscriber } from "@/components/premium/SubscriberProvider";
import { supabase } from "@/lib/supabase/client";
import { PageHeader } from "@/components/premium/States";

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  active: { label: "Ativa", tone: "bg-green-100 text-green-700" },
  past_due: { label: "Pagamento pendente", tone: "bg-amber-100 text-amber-700" },
  canceled: { label: "Cancelada", tone: "bg-zinc-200 text-zinc-600" },
  inactive: { label: "Inativa", tone: "bg-amber-100 text-amber-700" },
};

const PERKS = [
  "Navegação sem anúncios",
  "Conteúdo exclusivo e Revista Monatiza",
  "Biblioteca pessoal e histórico",
  "Newsletter premium",
];

export default function ContaPage() {
  const { user, plan, status, periodEnd } = useSubscriber();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const info = STATUS_LABEL[status ?? "active"] ?? STATUS_LABEL.active;

  async function openPortal() {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push("/painel/login");
      return;
    }
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const json = await res.json();
    if (json.url) {
      window.location.href = json.url;
    } else {
      alert(json.error || "Não foi possível abrir o portal de cobrança.");
      setLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <PageHeader eyebrow={<><Crown size={14} /> Minha conta</>} title="Sua assinatura" />

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Assinante</p>
            <p className="mt-1 text-lg font-bold">{user?.name || user?.email}</p>
            <div className="mt-3 flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${info.tone}`}>{info.label}</span>
              {plan && <span className="text-sm capitalize text-zinc-500">Plano {plan}</span>}
            </div>
            {periodEnd && (
              <p className="mt-3 text-[13px] text-zinc-500">
                Renova em {new Date(periodEnd).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
          <button
            onClick={openPortal}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0b0b0c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#E0263B] disabled:opacity-60"
          >
            <CreditCard size={16} />
            {loading ? "Abrindo…" : "Gerenciar assinatura"}
          </button>
        </div>

        <ul className="mt-7 grid gap-2.5 border-t border-zinc-100 pt-6 sm:grid-cols-2">
          {PERKS.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-[14px] text-zinc-700">
              <Check size={17} strokeWidth={3} className="mt-[1px] shrink-0 text-[#E0263B]" /> {p}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Link href="/" className="text-[13px] font-semibold text-zinc-500 hover:text-black">
          Ver site público
        </Link>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-zinc-500 hover:text-[#E0263B]"
        >
          <LogOut size={15} /> Sair
        </button>
      </div>
    </div>
  );
}
