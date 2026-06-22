import { supabaseAdmin } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function BriefingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("magazine_forms")
    .select(`
      *,
      magazine_orders (
        nome,
        email,
        telefone,
        plano,
        status
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <div
        style={{ fontFamily: "'Google Sans', 'Inter', 'Segoe UI', sans-serif" }}
        className="min-h-screen bg-[#F8F9FF] flex items-center justify-center"
      >
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm px-10 py-12 text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-[#111827] mb-1">Briefing não encontrado</p>
          <p className="text-xs text-[#9CA3AF] mb-6">O registro com ID <span className="font-mono text-[#6366F1]">{id}</span> não existe ou foi removido.</p>
          <Link
            href="/editorial/revista"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6366F1] hover:underline"
          >
            ← Voltar para Revista
          </Link>
        </div>
      </div>
    );
  }

  const order = data.magazine_orders as any;

  return (
    <div
      style={{ fontFamily: "'Google Sans', 'Inter', 'Segoe UI', sans-serif" }}
      className="min-h-screen bg-[#F8F9FF] p-6 md:p-10"
    >
      {/* Back */}
      <Link
        href="/editorial/revista"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] hover:text-[#6366F1] transition-colors mb-6"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Voltar para Revista
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <span className="text-xs font-medium text-[#6366F1] uppercase tracking-widest">
            Editorial · Briefing
          </span>
          <h1 className="text-[28px] font-semibold text-[#0F0F1A] leading-tight tracking-tight mt-1">
            {order?.nome ?? "Briefing Editorial"}
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">{order?.email}</p>
        </div>
        <StatusBadge status={order?.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left col — dados do cliente */}
        <div className="lg:col-span-1 space-y-4">

          {/* Card cliente */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F3F4F6]">
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Dados do Cliente</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              <Field label="Nome" value={order?.nome} />
              <Field label="Email" value={order?.email} />
              <Field label="Telefone" value={order?.telefone} />
              <Field label="Plano" value={order?.plano} pill />
            </div>
          </div>

          {/* Card empresa */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F3F4F6]">
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Empresa</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              <Field label="Empresa" value={data.nome_empresa} />
              <Field label="Cargo" value={data.cargo} />
              <Field label="WhatsApp" value={data.whatsapp} />
              <Field label="Instagram" value={data.instagram} link={data.instagram ? `https://instagram.com/${data.instagram.replace("@", "")}` : undefined} />
              <Field label="LinkedIn" value={data.linkedin} link={data.linkedin} />
              <Field label="Site" value={data.site} link={data.site} />
            </div>
          </div>

        </div>

        {/* Right col — conteúdo */}
        <div className="lg:col-span-2 space-y-4">

          <ContentCard title="Tema da Matéria" content={data.tema_materia} color="#6366F1" />
          <ContentCard title="Biografia" content={data.biografia} color="#8B5CF6" />
          <ContentCard title="Observações" content={data.observacoes} color="#F59E0B" />

        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────── */

function Field({
  label,
  value,
  link,
  pill,
}: {
  label: string;
  value?: string;
  link?: string;
  pill?: boolean;
}) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-[#9CA3AF] mb-0.5">{label}</p>
      {pill ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EEF2FF] text-[#4F46E5]">
          {value}
        </span>
      ) : link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#6366F1] hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-medium text-[#111827] break-words">{value}</p>
      )}
    </div>
  );
}

function ContentCard({
  title,
  content,
  color,
}: {
  title: string;
  content?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">{title}</p>
      </div>
      <div className="px-5 py-4">
        {content ? (
          <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">{content}</p>
        ) : (
          <p className="text-sm text-[#9CA3AF] italic">Não informado</p>
        )}
      </div>
    </div>
  );
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
  if (!cfg) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}