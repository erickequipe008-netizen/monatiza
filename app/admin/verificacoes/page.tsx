"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import PageHeader from "@/components/layout/PageHeader";
import { Check, X, Loader2, Users, FileText, Film, BadgeCheck, Crown } from "lucide-react";

interface Req {
  user_id: string;
  status: string;
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

  async function decide(user_id: string, action: "approve" | "reject") {
    setActing(user_id);
    const { data: { session } } = await supabase.auth.getSession();
    await fetch("/api/admin/verifications", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ user_id, action }),
    });
    await load();
    setActing(null);
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
                            <p className="font-bold text-[#0b0b0c]">{name}</p>
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
                            onClick={() => decide(r.user_id, "approve")}
                            disabled={acting === r.user_id}
                            className="flex items-center gap-1.5 rounded-lg bg-[#0b0b0c] px-4 py-1.5 text-[13px] font-semibold text-white transition hover:bg-[#E0263B] disabled:opacity-50"
                          >
                            {acting === r.user_id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            Aprovar selo
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
