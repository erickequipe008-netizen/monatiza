import Link from "next/link";
import { Check, Crown, Sparkles, BookOpen, BellRing, Ban } from "lucide-react";

export const metadata = {
  title: "Assinantes",
  description:
    "Assine a Monatiza: jornalismo independente de negócios, IA, mercado e tecnologia — sem anúncios e com conteúdo exclusivo.",
};

// ── Ajuste preços e benefícios dos planos aqui ──────────────
const PLANS = [
  {
    name: "Digital",
    plano: "mensal",
    price: "R$ 19,90",
    period: "/mês",
    highlight: false,
    badge: "",
    cta: "Assinar mensal",
    features: [
      "Acesso ilimitado a todas as matérias",
      "Newsletter premium",
      "Navegação sem anúncios",
      "Cancele quando quiser",
    ],
  },
  {
    name: "Anual",
    plano: "anual",
    price: "R$ 199",
    period: "/ano",
    highlight: true,
    badge: "Economize 2 meses",
    cta: "Assinar anual",
    features: [
      "Tudo do plano Digital",
      "2 meses grátis no plano anual",
      "Acesso à Revista Monatiza",
      "Conteúdo e séries exclusivas",
      "Suporte prioritário",
    ],
  },
];

const BENEFITS = [
  { icon: Ban, title: "Sem anúncios", desc: "Leia com foco total, sem banners no caminho." },
  { icon: Sparkles, title: "Conteúdo exclusivo", desc: "Análises, séries e bastidores só para assinantes." },
  { icon: BellRing, title: "Newsletter premium", desc: "As pautas que importam, direto no seu e-mail." },
  { icon: BookOpen, title: "Acesso à Revista", desc: "Reportagens especiais e grandes perfis da Monatiza." },
];

export default function AssinantesPage() {
  return (
    <div className="bg-[#f5f5f5] min-h-screen text-black">
      {/* ── HERO ── */}
      <section className="bg-black text-white">
        <div className="max-w-[1100px] mx-auto px-4 md:px-5 py-16 md:py-24 text-center">
          <span className="inline-flex items-center gap-2 text-red-500 text-[11px] font-black uppercase tracking-widest mb-5">
            <Crown size={14} /> Assinantes Monatiza
          </span>
          <h1 className="text-[34px] md:text-[56px] font-serif font-black leading-[1.05] tracking-tight">
            Jornalismo independente
            <br className="hidden md:block" /> vale o seu apoio
          </h1>
          <p className="text-zinc-300 text-[15px] md:text-[18px] mt-5 max-w-2xl mx-auto leading-relaxed">
            Negócios, IA, mercado e tecnologia com profundidade — sem anúncios,
            com conteúdo exclusivo e a Revista Monatiza.
          </p>
          <a
            href="#planos"
            className="inline-block mt-8 bg-red-600 text-white px-8 py-4 text-sm font-bold hover:bg-red-700 transition"
          >
            Ver planos
          </a>
        </div>
      </section>

      {/* ── BENEFÍCIOS ── */}
      <section className="max-w-[1100px] mx-auto px-4 md:px-5 py-14 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="bg-white border border-zinc-200 p-6">
              <b.icon size={26} className="text-red-600" strokeWidth={2.2} />
              <h3 className="text-[17px] font-black mt-4">{b.title}</h3>
              <p className="text-zinc-500 text-sm mt-2 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="max-w-[1100px] mx-auto px-4 md:px-5 pb-16 md:pb-24">
        <div className="flex items-center gap-3 mb-9">
          <h2 className="text-[24px] md:text-[30px] font-black tracking-tight">Escolha seu plano</h2>
          <div className="flex-1 h-px bg-zinc-300" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[820px]">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white p-8 border ${
                plan.highlight ? "border-black shadow-xl" : "border-zinc-200"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-8 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1">
                  {plan.badge}
                </span>
              )}
              <h3 className="text-[13px] font-black uppercase tracking-widest text-zinc-500">
                {plan.name}
              </h3>
              <div className="flex items-end gap-1 mt-3">
                <span className="text-[40px] font-black leading-none tracking-tight">{plan.price}</span>
                <span className="text-zinc-500 text-sm mb-1">{plan.period}</span>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[14px] text-zinc-700">
                    <Check size={18} className="text-red-600 shrink-0 mt-[1px]" strokeWidth={3} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/assinar?plano=${plan.plano}`}
                className={`block text-center mt-8 py-4 text-sm font-bold transition ${
                  plan.highlight
                    ? "bg-black text-white hover:opacity-80"
                    : "border border-black text-black hover:bg-black hover:text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-zinc-500 text-sm mt-8">
          Já é assinante?{" "}
          <Link href="/painel/login" className="text-black font-bold hover:text-red-600 transition">
            Entrar
          </Link>
        </p>
      </section>

      {/* ── RODAPÉ ── */}
      <div className="border-t border-zinc-300 py-8 text-center text-xs text-zinc-400">
        <Link href="/" className="hover:text-black transition font-bold">
          monatiza
        </Link>
        {" · "}Apoie o jornalismo independente
      </div>
    </div>
  );
}
