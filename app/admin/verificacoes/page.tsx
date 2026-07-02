"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import PageHeader from "@/components/layout/PageHeader";
import { Check, X, Loader2, Users, FileText, Film, BadgeCheck, Crown } from "lucide-react";

interface Req {
  user_id: string;
  status: string;
  tier?: string;
  created_at: string;
  profile: { handle?: string; display_name?: string; avatar_url?: string } | null;
  docUrl: string | null;
  selfieUrl: string | null;
}

export default function AdminVerificacoesPage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [reqs, setReqs] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [handle, setHandle] = useState("");
  const [manualMsg, setManualMsg] = useState("");
  const [manualBusy, setManualBusy] = useState(false);
  const [tier, setTier] = useState<"gold" | "silver">("gold");

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    const res = await fetch("/api/admin/verifications", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const json = await res.json();
    setStats(json.stats ?? null);
    setReqs(json.requests ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function decide(user_id: string, action: "approve" | "reject", reqTier?: string) {
    setActing(user_id);
    const { data: { session } } = await supabase.auth.getSession();
    await fetch("/api/admin/verifications", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      // usa o nível que a pessoa pagou; se não houver, usa o selecionado acima
      body: JSON.stringify({ user_id, action, tier: reqTier || tier }),
    });
    await load();
    setActing(null);
  }

  async function manualVerify(action: "grant" | "revoke") {
    const h = handle.trim().replace(/^@/, "");
    if (!h) return;
    setManualBusy(true);
    setManualMsg("");
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/admin/verifications", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ handle: h, action, tier }),
    });
    const json = await res.json();
    setManualBusy(false);
    if (json.ok) {
      setManualMsg(action === "grant" ? `✓ @${h} verificado!` : `Selo removido de @${h}.`);
      setHandle("");
      load();
    } else {
      setManualMsg(json.error || "Erro");
    }
  }

  const cards = stats
    ? [
        { label: "Assinantes ativos", value: stats.activeSubscribers, icon: Crown },
        { label: "Membros", value: stats.members, icon: Users },
        { label: "Publicações", value: stats.posts, icon: FileText },
        { label: "Vídeos", value: stats.reels, icon: Film },
        { label: "Verificações pendentes", value: stats.pending, icon: BadgeCheck },
      ]
    : [];

  return (
    <>
      <PageHeader title="Verificações" description="Aprove os selos e acompanhe a comunidade" />

      <div className="p-6 md:p-8 space-y-8">
        {loading ? (
          <p className="text-sm text-zinc-400">Carregando…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {cards.map((c) => (
                <div key={c.label} className="rounded-2xl border border-gray-100 bg-white p-4">
                  <c.icon size={18} className="text-[#E0263B]" />
                  <p className="mt-3 text-2xl font-black text-[#0b0b0c]">{c.value}</p>
                  <p className="text-[12px] text-gray-500">{c.label}</p>
                </div>
              ))}
            </div>

            {/* Verificação manual por @ */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="text-sm font-bold text-[#0b0b0c]">Verificar manualmente</h2>
              <p className="mb-3 mt-0.5 text-xs text-gray-500">
                Escolha o nível do selo — vale para a verificação manual e para aprovar os pedidos abaixo.
              </p>
              <div className="mb-3 inline-flex rounded-lg border border-gray-200 p-0.5">
                <button
                  onClick={() => setTier("silver")}
                  className={`rounded-md px-4 py-1.5 text-[13px] font-bold transition ${tier === "silver" ? "bg-[#0b0b0c] text-white" : "text-gray-500 hover:text-gray-800"}`}
                >
                  🥈 Prata · negócio real
                </button>
                <button
                  onClick={() => setTier("gold")}
                  className={`rounded-md px-4 py-1.5 text-[13px] font-bold transition ${tier === "gold" ? "bg-[#0b0b0c] text-white" : "text-gray-500 hover:text-gray-800"}`}
                >
                  🥇 Ouro · autoridade
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px] flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                  <input
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace(/^@/, ""))}
                    placeholder="usuario"
                    className="w-full rounded-lg border border-gray-200 py-2 pl-7 pr-3 text-sm outline-none focus:border-[#0b0b0c]"
                  />
                </div>
                <button
                  onClick={() => manualVerify("grant")}
                  disabled={manualBusy}
                  className="rounded-lg bg-[#0b0b0c] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#E0263B] disabled:opacity-50"
                >
                  Verificar
                </button>
                <button
                  onClick={() => manualVerify("revoke")}
                  disabled={manualBusy}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-[13px] font-semibold text-gray-600 transition hover:border-gray-400 disabled:opacity-50"
                >
                  Remover
                </button>
              </div>
              {manualMsg && <p className="mt-2 text-[13px] font-semibold text-gray-700">{manualMsg}</p>}
            </div>

            <div>
              <h2 className="mb-3 text-sm font-bold text-[#0b0b0c]">Pedidos de verificação</h2>
              {reqs.length === 0 ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500">
                  Nenhum pedido pendente.
                </div>
              ) : (
                <div className="space-y-4">
                  {reqs.map((r) => {
                    const name = r.profile?.display_name || r.profile?.handle || "Membro";
                    return (
                      <div key={r.user_id} className="rounded-2xl border border-gray-100 bg-white p-5">
                        <div className="flex items-center gap-3">
                          {r.profile?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.profile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E0263B] font-bold text-white">
                              {name.charAt(0).toUpperCase()}
                            </span>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-[#0b0b0c]">{name}</p>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${r.tier === "silver" ? "bg-zinc-200 text-zinc-700" : "bg-amber-100 text-amber-700"}`}>
                                {r.tier === "silver" ? "Prata" : "Ouro"}
                              </span>
                            </div>
                            <p className="text-[12px] text-gray-400">
                              @{r.profile?.handle} · {r.status === "review" ? "documentos enviados" : "aguardando documentos"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          {(["docUrl", "selfieUrl"] as const).map((k) => (
                            <div key={k}>
                              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                {k === "docUrl" ? "Documento" : "Selfie"}
                              </p>
                              {r[k] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <a href={r[k]!} target="_blank" rel="noreferrer">
                                  <img src={r[k]!} alt="" className="h-40 w-full rounded-lg border border-gray-100 object-cover" />
                                </a>
                              ) : (
                                <div className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed border-gray-200 text-[12px] text-gray-300">
                                  não enviado
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <button
                            onClick={() => decide(r.user_id, "reject")}
                            disabled={acting === r.user_id}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-[13px] font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            <X size={14} /> Rejeitar
                          </button>
                          <div className="flex-1" />
                          <button
                            onClick={() => decide(r.user_id, "approve", r.tier)}
                            disabled={acting === r.user_id}
                            className="flex items-center gap-1.5 rounded-lg bg-[#0b0b0c] px-4 py-1.5 text-[13px] font-semibold text-white transition hover:bg-[#E0263B] disabled:opacity-50"
                          >
                            {acting === r.user_id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            Aprovar selo {r.tier === "silver" ? "Prata" : "Ouro"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
