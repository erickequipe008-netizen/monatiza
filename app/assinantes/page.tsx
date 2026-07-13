import Link from "next/link";
import { Check, Crown, Sparkles, BookOpen, Ban, Zap, FileText, Download, Mail, ArrowRight } from "lucide-react";

export const metadata = {
  title: "MonatizaPlus — assine e leia sem limites",
  description:
    "Assine o MonatizaPlus: todas as matérias completas, portal sem anúncios e as revistas digitais de graça. A rede social da Monatiza é gratuita e separada.",
};

// ── Ajuste preços e benefícios dos planos aqui ──────────────
const PLANS = [
  {
    name: "Plus Mensal",
    plano: "mensal",
    price: "R$ 19,90",
    period: "/mês",
    highlight: false,
    badge: "Teste grátis",
    cta: "Começar grátis",
    features: [
      "Todas as matérias completas, sem paywall",
      "Portal sem anúncios",
      "Revistas digitais grátis (ler e baixar)",
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
      "Conteúdo e séries exclusivas",
      "Acesso antecipado às grandes reportagens",
      "Suporte prioritário",
    ],
  },
];

const BENEFITS = [
  { icon: FileText, title: "Matérias completas", desc: "Leia todas as reportagens do início ao fim, sem paywall." },
  { icon: Ban, title: "Sem anúncios", desc: "Navegue no portal com leitura limpa, sem banners no caminho." },
  { icon: Download, title: "Revistas grátis", desc: "Baixe todas as revistas digitais publicadas sem pagar por edição." },
  { icon: Sparkles, title: "Conteúdo exclusivo", desc: "Análises, séries e bastidores só para assinantes." },
  { icon: Zap, title: "Acesso antecipado", desc: "Prioridade nas grandes reportagens antes de todo mundo." },
  { icon: Mail, title: "Newsletter premium", desc: "A curadoria da Monatiza direto no seu e-mail, sem ruído." },
];

export default function AssinantesPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* ── HERO minimalista (sem caixa forçada) ── */}
      <section className="mx-auto max-w-[900px] px-4 pb-10 pt-16 text-center md:pt-24">
        <span className="pro-gradient-text inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.25em]">
          <Crown size={14} /> MonatizaPlus
        </span>
        <h1 className="mt-4 font-serif text-[40px] font-black leading-[1.03] tracking-tight md:text-[58px]">
          Leia sem limites.
          <br className="hidden md:block" /> <span className="pro-gradient-text">Sem anúncios.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-zinc-500 md:text-[17px]">
          Assine o MonatizaPlus: todas as matérias completas, o portal sem anúncios e as revistas
          digitais de graça.
        </p>
        <a
          href="#planos"
          className="pro-gradient mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
        >
          Ver planos <ArrowRight size={16} />
        </a>
        <p className="mt-5 text-[13px] text-zinc-400">
          A rede social da Monatiza é gratuita —{" "}
          <Link href="/comunidade" className="font-bold text-zinc-700 underline underline-offset-2 hover:text-black">
            conheça a comunidade
          </Link>
          .
        </p>
      </section>

      {/* ── BENEFÍCIOS ── */}
      <section className="mx-auto max-w-[1100px] px-4 pb-4 md:px-5">
        <div className="mb-9 flex items-center gap-3">
          <h2 className="text-[22px] font-black tracking-tight md:text-[28px]">O que você recebe ao assinar</h2>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="pro-gradient inline-flex h-11 w-11 items-center justify-center rounded-xl text-white">
                <b.icon size={22} strokeWidth={2.2} />
              </span>
              <h3 className="mt-4 text-[17px] font-black">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="mx-auto max-w-[860px] px-4 py-16 md:px-5 md:py-20">
        <div className="mb-9 flex items-center gap-3">
          <h2 className="text-[22px] font-black tracking-tight md:text-[28px]">Escolha seu plano</h2>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl bg-white p-8 ${
                plan.highlight
                  ? "border-2 border-transparent shadow-xl [background:linear-gradient(white,white)_padding-box,linear-gradient(120deg,#4285F4,#9B72CB,#FF2D87)_border-box]"
                  : "border border-zinc-200"
              }`}
            >
              {plan.badge && (
                <span className="pro-gradient absolute -top-3 left-8 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                  {plan.badge}
                </span>
              )}
              <h3 className="text-[13px] font-black uppercase tracking-widest text-zinc-500">{plan.name}</h3>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-[40px] font-black leading-none tracking-tight">{plan.price}</span>
                <span className="mb-1 text-sm text-zinc-500">{plan.period}</span>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[14px] text-zinc-700">
                    <Check size={18} className="mt-[1px] shrink-0 text-[#9B72CB]" strokeWidth={3} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/assinar?plano=${plan.plano}`}
                className={`mt-8 block rounded-full py-4 text-center text-sm font-bold transition ${
                  plan.highlight
                    ? "pro-gradient text-white hover:opacity-90"
                    : "border border-black text-black hover:bg-black hover:text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Já é assinante?{" "}
          <Link href="/painel/login" className="pro-gradient-text font-bold">
            Entrar
          </Link>
        </p>
      </section>

      {/* ── RODAPÉ ── */}
      <div className="border-t border-zinc-200 py-8 text-center text-xs text-zinc-400">
        <Link href="/" className="font-bold text-zinc-700 transition hover:text-black">
          monatiza
        </Link>
        {" · "}Apoie o jornalismo independente
      </div>
    </div>
  );
}
