import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function PedidosRevista() {
  const { data: pedidos, error } = await supabaseAdmin
    .from("magazine_orders")
    .select("*")
    .order("created_at", { ascending: false });

  const total = pedidos?.length ?? 0;
  const enviados = pedidos?.filter((p: any) => p.status === "formulario_enviado").length ?? 0;
  const outros = total - enviados;

  return (
    <div
      style={{ fontFamily: "'Google Sans', 'Inter', 'Segoe UI', sans-serif" }}
      className="min-h-screen bg-[#F8F9FF] p-6 md:p-10"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-[#6366F1] uppercase tracking-widest">
            Editorial · Revista
          </span>
        </div>
        <h1 className="text-[28px] font-semibold text-[#0F0F1A] leading-tight tracking-tight">
          Pedidos da Revista
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Acompanhe e gerencie todas as solicitações recebidas.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] px-5 py-4 shadow-sm">
          <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-1">
            Total de Pedidos
          </p>
          <p className="text-3xl font-bold text-[#0F0F1A]">{total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] px-5 py-4 shadow-sm">
          <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-1">
            Formulário Enviado
          </p>
          <p className="text-3xl font-bold text-[#6366F1]">{enviados}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] px-5 py-4 shadow-sm">
          <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide mb-1">
            Outros Status
          </p>
          <p className="text-3xl font-bold text-[#F59E0B]">{outros}</p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 mb-6 text-sm">
          Erro ao carregar pedidos: {error.message}
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {/* Table header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
          <span className="text-sm font-semibold text-[#111827]">
            Lista de Pedidos
          </span>
          <span className="text-xs text-[#9CA3AF]">
            {total} {total === 1 ? "registro" : "registros"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Plano
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {pedidos && pedidos.length > 0 ? (
                pedidos.map((pedido: any) => (
                  <tr
                    key={pedido.id}
                    className="hover:bg-[#F5F6FF] transition-colors duration-100"
                  >
                    {/* Avatar + Nome */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: stringToColor(pedido.nome ?? "?") }}
                        >
                          {getInitials(pedido.nome)}
                        </div>
                        <span className="font-medium text-[#111827]">
                          {pedido.nome ?? "—"}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-[#374151]">
                      {pedido.email ?? "—"}
                    </td>

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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-[#9CA3AF] text-sm">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────── */

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function stringToColor(str: string) {
  const colors = [
    "#6366F1", "#8B5CF6", "#EC4899", "#14B8A6",
    "#F59E0B", "#10B981", "#3B82F6", "#F97316",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    formulario_enviado: {
      label: "Formulário Enviado",
      bg: "#EEF2FF",
      text: "#4F46E5",
      dot: "#6366F1",
    },
    aprovado: {
      label: "Aprovado",
      bg: "#ECFDF5",
      text: "#065F46",
      dot: "#10B981",
    },
    pendente: {
      label: "Pendente",
      bg: "#FFFBEB",
      text: "#92400E",
      dot: "#F59E0B",
    },
    cancelado: {
      label: "Cancelado",
      bg: "#FEF2F2",
      text: "#991B1B",
      dot: "#EF4444",
    },
  };

  const cfg = status ? map[status] : undefined;

  if (!cfg) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F3F4F6] text-[#6B7280]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
        {status ?? "—"}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
}