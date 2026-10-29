"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import PageHeader from "@/components/layout/PageHeader";
import { Plus, Minus, Loader2 } from "lucide-react";

interface Journalist {
  id: string;
  name: string | null;
  display_name: string | null;
  email: string | null;
}
interface Credit {
  journalist_id: string;
  balance: number;
  total_purchased: number;
  total_used: number;
}
interface Tx {
  id: string;
  journalist_id: string;
  amount_paid: number | null;
  credits_added: number;
  status: string;
  created_at: string;
}

export default function AdminCreditosPage() {
  const [loading, setLoading] = useState(true);
  const [journalists, setJournalists] = useState<Journalist[]>([]);
  const [credits, setCredits] = useState<Record<string, Credit>>({});
  const [txs, setTxs] = useState<Tx[]>([]);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const [{ data: js }, { data: cs }, { data: ts }] = await Promise.all([
      supabase.from("journalists").select("id, name, display_name, email"),
      supabase.from("journalist_credits").select("journalist_id, balance, total_purchased, total_used"),
      supabase.from("credit_transactions").select("*").order("created_at", { ascending: false }).limit(40),
    ]);
    setJournalists((js as Journalist[]) || []);
    const map: Record<string, Credit> = {};
    ((cs as Credit[]) || []).forEach((c) => (map[c.journalist_id] = c));
    setCredits(map);
    setTxs((ts as Tx[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function adjust(journalistId: string, sign: 1 | -1) {
    const amount = Math.abs(Math.trunc(qty[journalistId] || 1)) || 1;
    setBusy(journalistId);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setBusy(null);
      return;
    }
    const res = await fetch("/api/admin/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ journalist_id: journalistId, delta: sign * amount }),
    });
    const json = await res.json();
    if (!res.ok) alert(json.error || "Erro ao ajustar créditos.");
    await load();
    setBusy(null);
  }

  const nameFor = (id: string) => {
    const j = journalists.find((x) => x.id === id);
    return j?.display_name || j?.name || j?.email || id.slice(0, 8);
  };

  const totalSold = txs.filter((t) => t.status === "concluido").reduce((s, t) => s + (t.credits_added || 0), 0);
  const revenue = txs.filter((t) => t.status === "concluido").reduce((s, t) => s + (t.amount_paid || 0), 0);

  return (
    <>
      <PageHeader title="Créditos" description="Saldos, ajustes manuais e histórico financeiro" />

      <div className="p-6 md:p-8 max-w-4xl space-y-6">
        {loading ? (
          <p className="text-sm text-zinc-400">Carregando…</p>
        ) : (
          <>
            {/* KPIs financeiros */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <p className="text-[11px] uppercase tracking-wide text-gray-400">Jornalistas</p>
                <p className="text-3xl font-black text-black mt-1">{journalists.length}</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <p className="text-[11px] uppercase tracking-wide text-gray-400">Créditos vendidos</p>
                <p className="text-3xl font-black text-black mt-1">{totalSold}</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <p className="text-[11px] uppercase tracking-wide text-gray-400">Receita</p>
                <p className="text-3xl font-black text-[#10B981] mt-1">
                  R$ {revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Saldos por jornalista */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                Saldo por jornalista
              </div>
              {journalists.length === 0 ? (
                <p className="p-6 text-sm text-gray-400">Nenhum jornalista cadastrado ainda.</p>
              ) : (
                journalists.map((j) => {
                  const c = credits[j.id];
                  return (
                    <div key={j.id} className="px-5 py-4 border-b border-gray-50 last:border-0 flex flex-wrap items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-bold text-black truncate">{j.display_name || j.name || "—"}</p>
                        <p className="text-xs text-gray-400 truncate">{j.email}</p>
                      </div>
                      <div className="text-center px-3">
                        <p className="text-[10px] uppercase text-gray-400">Saldo</p>
                        <p className="text-xl font-black text-black">{c?.balance ?? 0}</p>
                      </div>
                      <div className="text-center px-3 hidden sm:block">
                        <p className="text-[10px] uppercase text-gray-400">Usados</p>
                        <p className="text-xl font-black text-gray-400">{c?.total_used ?? 0}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={qty[j.id] ?? 1}
                          onChange={(e) => setQty((q) => ({ ...q, [j.id]: Number(e.target.value) }))}
                          className="w-14 h-9 px-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center outline-none focus:border-gray-400"
                        />
                        <button
                          onClick={() => adjust(j.id, 1)}
                          disabled={busy === j.id}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#0b0b0c] text-white hover:bg-[#E0263B] transition disabled:opacity-50"
                          title="Adicionar"
                        >
                          {busy === j.id ? <Loader2 size={14} className="animate-spin" /> : <Plus size={15} />}
                        </button>
                        <button
                          onClick={() => adjust(j.id, -1)}
                          disabled={busy === j.id}
                          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 transition disabled:opacity-50"
                          title="Remover"
                        >
                          <Minus size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Histórico */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                Histórico financeiro
              </div>
              {txs.length === 0 ? (
                <p className="p-6 text-sm text-gray-400">Nenhuma transação ainda.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <tbody>
                    {txs.map((t) => (
                      <tr key={t.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-5 py-3 font-semibold text-black">{nameFor(t.journalist_id)}</td>
                        <td className="px-5 py-3">
                          <span className={t.credits_added >= 0 ? "text-green-600" : "text-red-600"}>
                            {t.credits_added >= 0 ? "+" : ""}
                            {t.credits_added} créd.
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">
                          {t.amount_paid ? `R$ ${t.amount_paid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs">{t.status}</td>
                        <td className="px-5 py-3 text-gray-400 text-xs hidden sm:table-cell">
                          {new Date(t.created_at).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
