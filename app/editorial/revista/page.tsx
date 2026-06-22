export default function RevistaAdmin() {
  const kpis = [
    { label: "Novos", value: 0, dot: "#6366F1", bg: "#EEF2FF", text: "#4F46E5" },
    { label: "Briefings", value: 0, dot: "#F59E0B", bg: "#FFFBEB", text: "#92400E" },
    { label: "Produção", value: 0, dot: "#3B82F6", bg: "#EFF6FF", text: "#1D4ED8" },
    { label: "Publicados", value: 0, dot: "#10B981", bg: "#ECFDF5", text: "#065F46" },
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
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: kpi.dot }}
              />
              <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wide">
                {kpi.label}
              </p>
            </div>
            <p
              className="text-3xl font-bold"
              style={{ color: kpi.text }}
            >
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Clientes da Revista */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6]">
          <div>
            <h2 className="text-sm font-semibold text-[#111827]">
              Clientes da Revista
            </h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Gerencie os clientes ativos e em prospecção
            </p>
          </div>

          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-150 hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Novo Cliente
          </button>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "#EEF2FF" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6366F1"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#374151] mb-1">
            Nenhum cliente cadastrado
          </p>
          <p className="text-xs text-[#9CA3AF] max-w-xs">
            Adicione o primeiro cliente da revista clicando em{" "}
            <span className="text-[#6366F1] font-medium">Novo Cliente</span>.
          </p>
        </div>
      </div>
    </div>
  );
}