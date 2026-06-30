import Link from "next/link";
import { Check, Crown, Sparkles, BookOpen, Ban, Zap, Users, ShieldCheck, Rocket, ArrowRight } from "lucide-react";

export const metadata = {
  title: "MonatizaPlus",
  description:
    "Assine o MonatizaPlus: jornalismo sem anúncios, conteúdo exclusivo e mais alcance e reconhecimento para o seu perfil.",
};

// ── Ajuste preços e benefícios dos planos aqui ──────────────
const PLANS = [
  {
    name: "Plus Mensal",
    plano: "mensal",
    price: "R$ 19,90",
    period: "/mês",
    highlight: false,
    badge: "",
    cta: "Assinar mensal",
    features: [
      "Conteúdos sempre em primeiro lugar",
      "Acesso ilimitado e sem anúncios",
      "Mais alcance do seu perfil na comunidade",
      "Mensagens diretas com outros assinantes",
      "Newsletter premium",
      "Cancele quando quiser",
    ],
  },
  {
    name: "Plus Anual",
    plano: "anual",
    price: "R$ 199",
    period: "/ano",
    highlight: true,
    badge: "Economize 2 meses",
    cta: "Assinar anual",
    features: [
      "Tudo do MonatizaPlus Mensal",
      "2 meses grátis no plano anual",
      "Acesso à Revista Monatiza",
      "Conteúdo e séries exclusivas",
      "Selo de reconhecimento disponível",
      "Suporte prioritário",
    ],
  },
];

const BENEFITS = [
  { icon: Zap, title: "Conteúdos sempre em primeiro", desc: "Acesso antecipado e prioridade nas grandes reportagens." },
  { icon: Ban, title: "Sem anúncios", desc: "Leitura limpa, com foco total — sem banners no caminho." },
  { icon: Sparkles, title: "Conteúdo exclusivo", desc: "Análises, séries e bastidores só para assinantes." },
  { icon: Users, title: "Mais alcance de perfil", desc: "Sua voz na comunidade: publique, ganhe seguidores e apareça mais." },
  { icon: ShieldCheck, title: "Reconhecimento", desc: "Selo dourado ao lado do seu nome: mais credibilidade e destaque." },
  { icon: BookOpen, title: "Revista + Newsletter", desc: "A Revista Monatiza e a newsletter premium no seu e-mail." },
];

export default function AssinantesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08080b] text-white">
      {/* brilhos de fundo (estilo tecnológico) */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[#7C3AED]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-[420px] w-[520px] rounded-full bg-[#FF2D87]/15 blur-[120px]" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[380px] w-[480px] rounded-full bg-[#4285F4]/10 blur-[120px]" />

      {/* ── HERO ── */}
      <section className="relative">
        <div className="mx-auto max-w-[1100px] px-4 py-20 text-center md:px-5 md:py-28">
          <span className="pro-gradient-text mb-6 inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.25em]">
            <Crown size={14} /> MonatizaPlus
          </span>
          <h1 className="text-[36px] font-black leading-[1.02] tracking-tight md:text-[60px]">
            Mais alcance.
            <br className="hidden md:block" />{" "}
            <span className="pro-gradient-text">Mais reconhecimento.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-zinc-400 md:text-[18px]">
            Assine o MonatizaPlus: jornalismo com profundidade e sem anúncios, sua voz com mais
            alcance na comunidade e o selo de reconhecimento.
          </p>
          <a
            href="#planos"
            className="pro-gradient pro-glow mt-9 inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white transition hover:opacity-90"
          >
            Ver planos <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* ── BENEFÍCIOS ── */}
      <section className="relative mx-auto max-w-[1100px] px-4 pb-6 md:px-5">
        <h2 className="mb-10 text-center text-[24px] font-black tracking-tight md:text-[32px]">
          O que você recebe ao assinar
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]"
            >
              <span className="pro-gradient inline-flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg shadow-[#9B72CB]/25">
                <b.icon size={22} strokeWidth={2.2} />
              </span>
              <h3 className="mt-5 text-[17px] font-bold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="relative mx-auto max-w-[920px] px-4 py-20 md:px-5 md:py-24">
        <h2 className="mb-12 text-center text-[24px] font-black tracking-tight md:text-[32px]">
          Escolha seu plano
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 ${
                plan.highlight ? "pro-border pro-glow" : "border border-white/10 bg-white/[0.03]"
              }`}
            >
              {plan.badge && (
                <span className="pro-gradient absolute -top-3 left-8 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                  {plan.badge}
                </span>
              )}
              <h3 className="text-[13px] font-black uppercase tracking-widest text-zinc-400">{plan.name}</h3>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-[42px] font-black leading-none tracking-tight">{plan.price}</span>
                <span className="mb-1 text-sm text-zinc-500">{plan.period}</span>
              </div>

              <ul className="mt-7 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[14px] text-zinc-200">
                    <span className="pro-gradient mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                      <Check size={12} strokeWidth={3} className="text-white" />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/assinar?plano=${plan.plano}`}
                className={`mt-8 flex items-center justify-center gap-2 rounded-full py-4 text-sm font-bold transition ${
                  plan.highlight
                    ? "pro-gradient text-white hover:opacity-90"
                    : "border border-white/15 text-white hover:bg-white/5"
                }`}
              >
                {plan.cta} <Rocket size={15} />
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-zinc-500">
          Já é assinante?{" "}
          <Link href="/painel/login" className="pro-gradient-text font-bold">
            Entrar
          </Link>
        </p>
      </section>

      {/* ── RODAPÉ ── */}
      <div className="relative border-t border-white/10 py-8 text-center text-xs text-zinc-500">
        <Link href="/" className="font-bold text-zinc-300 transition hover:text-white">
          monatiza
        </Link>
        {" · "}Apoie o jornalismo independente
      </div>
    </div>
  );
}
