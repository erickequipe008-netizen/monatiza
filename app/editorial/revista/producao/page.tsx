import { supabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function RevistaAdmin() {
  const { data: pedidos, error } = await supabaseAdmin
    .from("magazine_orders")
    .select(`
      *,
      magazine_forms (
        id
      )
    `)
    .order("created_at", { ascending: false });

  const total = pedidos?.length ?? 0;
  const novos      = pedidos?.filter((p: any) => p.status === "novo").length ?? 0;
  const briefings  = pedidos?.filter((p: any) => p.status === "briefing").length ?? 0;
  const producao   = pedidos?.filter((p: any) => p.status === "producao").length ?? 0;
  const publicados = pedidos?.filter((p: any) => p.status === "publicado").length ?? 0;

  const kpis = [
    { label: "Novos",      value: novos,      dot: "#6366F1", text: "#4F46E5" },
    { label: "Briefings",  value: briefings,  dot: "#F59E0B", text: "#92400E" },
    { label: "Produção",   value: producao,   dot: "#3B82F6", text: "#1D4ED8" },
    { label: "Publicados", value: publicados, dot: "#10B981", text: "#065F46" },
  ];

  return (
    <div
      style={{ fontFamily: "'Google Sans', 'Inter', 'Segoe UI', sans-serif" }}
      className="min-h-screen bg-[#F8F9FF] p-6 md:p-10"
    >
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-medium text-[#6366F1] uppercase tracking-widest">
          Editorial
        </span>
        <h1 className="text-[28px] font-semibold text-[#0F0F1A] leading-tight tracking-tight mt-1">
          Revista Empreende Brazil
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Gerencie clientes, briefings e publicações da revista.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-2xl border border-[#E5E7EB] px-5 py-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full" style={{ background: kpi.dot }} />
              <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide">
                {kpi.label}
              </p>
            </div>
            <p className="text-3xl font-bold" style={{ color: kpi.text }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-6 text-sm">
          Erro ao carregar pedidos: {error.message}
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
          <div>
            <h2 className="text-sm font-semibold text-[#111827]">Clientes da Revista</h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {total} {total === 1 ? "registro" : "registros"} encontrados
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-150 hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Novo Cliente
          </button>
        </div>

        {total > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                  {["Nome", "Email", "Plano", "Status", "Data", ""].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {pedidos?.map((pedido: any) => {
                  const formId = pedido.magazine_forms?.[0]?.id ?? null;
                  return (
                    <tr
                      key={pedido.id}
                      className="hover:bg-[#F5F6FF] transition-colors duration-100"
                    >
                      {/* Nome */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: stringToColor(pedido.nome ?? "?") }}
                          >
                            {getInitials(pedido.nome)}
                          </div>
                          <span className="font-medium text-[#111827]">{pedido.nome ?? "—"}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-[#374151]">{pedido.email ?? "—"}</td>

                      {/* Plano */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EEF2FF] text-[#4F46E5]">
                          {pedido.plano ?? "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={pedido.status} />
                      </td>

                      {/* Data */}
                      <td className="px-6 py-4 text-[#9CA3AF] text-xs">
                        {pedido.created_at
                          ? new Date(pedido.created_at).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Ação */}
                      <td className="px-6 py-4">
                        {formId ? (
                          <Link
                            href={`/editorial/revista/producao/${formId}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#6366F1] bg-[#EEF2FF] hover:bg-[#E0E7FF] transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            Ver Briefing
                          </Link>
                        ) : (
                          <span className="text-xs text-[#9CA3AF]">Sem briefing</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#EEF2FF" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#374151] mb-1">Nenhum cliente cadastrado</p>
            <p className="text-xs text-[#9CA3AF] max-w-xs">
              Adicione o primeiro cliente clicando em{" "}
              <span className="text-[#6366F1] font-medium">Novo Cliente</span>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────── */

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function stringToColor(str: string) {
  const colors = ["#6366F1","#8B5CF6","#EC4899","#14B8A6","#F59E0B","#10B981","#3B82F6","#F97316"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    formulario_enviado: { label: "Formulário Enviado", bg: "#EEF2FF", text: "#4F46E5", dot: "#6366F1" },
    novo:      { label: "Novo",      bg: "#EEF2FF", text: "#4F46E5", dot: "#6366F1" },
    briefing:  { label: "Briefing",  bg: "#FFFBEB", text: "#92400E", dot: "#F59E0B" },
    producao:  { label: "Produção",  bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
    publicado: { label: "Publicado", bg: "#ECFDF5", text: "#065F46", dot: "#10B981" },
    aprovado:  { label: "Aprovado",  bg: "#ECFDF5", text: "#065F46", dot: "#10B981" },
    cancelado: { label: "Cancelado", bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444" },
  };
  const cfg = status ? map[status] : undefined;
  if (!cfg) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F3F4F6] text-[#6B7280]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
      {status ?? "—"}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: cfg.bg, color: cfg.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}