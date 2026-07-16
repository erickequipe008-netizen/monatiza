"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Apple,
  Play,
  ShieldCheck,
  Zap,
  MapPin,
  Sparkles,
  PenSquare,
  Users,
  MessagesSquare,
  Compass,
  Heart,
  TrendingUp,
} from "lucide-react";

const FEATURES = [
  { icon: PenSquare, title: "Publique e seja lido", desc: "Sua experiência vira conteúdo. E conteúdo vira autoridade." },
  { icon: Users, title: "Construa sua rede", desc: "Siga, ganhe seguidores e cerque-se de quem também constrói." },
  { icon: MessagesSquare, title: "Converse em tempo real", desc: "Comentários, respostas e mensagens diretas com quem entende." },
  { icon: Compass, title: "Descubra o que importa", desc: "Notícias e comunidade no mesmo feed. Sem ruído, no seu ritmo." },
  { icon: Heart, title: "Engajamento que soma", desc: "Uma comunidade que reconhece boas ideias e eleva quem contribui." },
  { icon: TrendingUp, title: "Cresça de verdade", desc: "Quem aparece, vende. Quem se posiciona, lidera." },
];

const TICKER = ["Negócios", "IA", "Mercado", "Política", "Tech", "Startups", "Empreende", "Carreira", "Saúde", "Revista"];

const TRUST = [
  { icon: Sparkles, label: "Grátis para sempre" },
  { icon: Zap, label: "Em tempo real" },
  { icon: ShieldCheck, label: "Seus dados protegidos" },
  { icon: MapPin, label: "Feito no Brasil" },
];

export default function ComunidadeLanding() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);

  // reveal ao rolar
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll<HTMLElement>(".cm-reveal");
    if (!els) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("cm-in")),
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // parallax suave dos brilhos com o mouse
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    function onMove(e: MouseEvent) {
      const r = hero!.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      hero!.style.setProperty("--px", `${x * 28}px`);
      hero!.style.setProperty("--py", `${y * 28}px`);
    }
    hero.addEventListener("mousemove", onMove);
    return () => hero.removeEventListener("mousemove", onMove);
  }, []);

  // revela o hero inteiro na entrada (não depende de scroll)
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      heroRef.current?.querySelectorAll<HTMLElement>(".cm-reveal").forEach((el) => el.classList.add("cm-in"))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div ref={rootRef} className="relative min-h-screen overflow-hidden bg-[#07070a] text-white">
      <style>{cmStyles}</style>

      {/* brilhos de fundo */}
      <div className="cm-orb cm-orb-a" />
      <div className="cm-orb cm-orb-b" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(29,155,240,0.10),transparent_55%)]" />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative flex flex-col items-center px-5 pb-24 pt-24 text-center md:min-h-[88vh] md:justify-center md:pt-28">
        <span className="cm-reveal inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#66b6ff] backdrop-blur">
          <Users size={13} /> A rede social das notícias
        </span>

        <h1 className="cm-reveal mt-7 max-w-[16ch] text-[42px] font-black leading-[0.98] tracking-[-0.03em] sm:text-[64px] md:text-[80px]" style={{ transitionDelay: "80ms" }}>
          A primeira rede social
          <br />
          <span className="cm-shine">de notícias do mundo.</span>
        </h1>

        <p className="cm-reveal mt-7 max-w-[42ch] text-[16px] leading-relaxed text-zinc-400 sm:text-[18px]" style={{ transitionDelay: "160ms" }}>
          Onde o jornalismo encontra as pessoas. Publique, debata e acompanhe o que move o
          mercado — tudo em tempo real, num só lugar.
        </p>

        <div className="cm-reveal mt-10 flex w-full flex-col items-center justify-center gap-3 sm:flex-row" style={{ transitionDelay: "240ms" }}>
          <Link href="/painel/cadastro?next=/app" className="cm-cta group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1d9bf0] px-8 py-4 text-[15px] font-bold text-white transition sm:w-auto">
            Criar conta grátis
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href="/app" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-8 py-4 text-[15px] font-bold text-white/90 transition hover:bg-white/[0.06] sm:w-auto">
            Acessar a comunidade
          </Link>
        </div>

        {/* lojas */}
        <div className="cm-reveal mt-6 flex flex-wrap items-center justify-center gap-3" style={{ transitionDelay: "320ms" }}>
          <StoreButton icon={<Apple size={22} className="-mt-0.5" />} top="Baixar na" bottom="App Store" />
          <StoreButton icon={<Play size={19} className="fill-current" />} top="Disponível no" bottom="Google Play" />
        </div>

        {/* selos de confiança (honestos) */}
        <div className="cm-reveal mt-9 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5" style={{ transitionDelay: "400ms" }}>
          {TRUST.map((t) => (
            <span key={t.label} className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-zinc-500">
              <t.icon size={14} className="text-[#1d9bf0]" /> {t.label}
            </span>
          ))}
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="cm-reveal relative border-y border-white/[0.06] py-4">
        <div className="cm-marquee flex w-max items-center gap-10 whitespace-nowrap">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-10 text-[15px] font-bold text-white/25">
              {t} <span className="text-[#1d9bf0]">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── MANIFESTO ── */}
      <section className="relative mx-auto max-w-[820px] px-5 py-28 text-center md:py-36">
        <span className="cm-reveal text-[12px] font-black uppercase tracking-[0.28em] text-[#1d9bf0]">O que é</span>
        <h2 className="cm-reveal mt-5 text-[30px] font-black leading-[1.12] tracking-tight md:text-[46px]" style={{ transitionDelay: "80ms" }}>
          Não é mais uma rede social.
          <br />
          <span className="text-zinc-500">É a primeira feita de notícia.</span>
        </h2>
        <p className="cm-reveal mx-auto mt-7 max-w-[52ch] text-[16px] leading-relaxed text-zinc-400 md:text-[18px]" style={{ transitionDelay: "160ms" }}>
          As outras redes foram feitas para passar o tempo. A Monatiza foi feita para fazer o tempo
          render: você se informa, se posiciona e conhece as pessoas certas — sem barulho e sem
          algoritmo brigando pela sua atenção.
        </p>
      </section>

      {/* ── RECURSOS (sem caixas) ── */}
      <section className="relative mx-auto max-w-[1040px] px-5 pb-28 md:pb-36">
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="cm-reveal" style={{ transitionDelay: `${i * 70}ms` }}>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-[#1d9bf0] ring-1 ring-inset ring-white/10">
                <f.icon size={22} strokeWidth={2} />
              </span>
              <h3 className="mt-5 text-[18px] font-black tracking-tight">{f.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative px-5 pb-32 text-center">
        <div className="cm-glow relative mx-auto max-w-[720px] py-16">
          <h2 className="cm-reveal text-[34px] font-black leading-[1.05] tracking-tight md:text-[52px]">
            Sua vez de <span className="cm-shine">aparecer.</span>
          </h2>
          <p className="cm-reveal mx-auto mt-5 max-w-[40ch] text-[15.5px] leading-relaxed text-zinc-400" style={{ transitionDelay: "80ms" }}>
            Junte-se à comunidade de quem informa, empreende e cresce. Leva 1 minuto para entrar.
          </p>
          <div className="cm-reveal mt-9" style={{ transitionDelay: "160ms" }}>
            <Link href="/painel/cadastro?next=/app" className="cm-cta group inline-flex items-center gap-2 rounded-full bg-[#1d9bf0] px-9 py-4 text-[15px] font-bold text-white transition">
              Criar conta grátis
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StoreButton({ icon, top, bottom }: { icon: React.ReactNode; top: string; bottom: string }) {
  return (
    <span className="group relative inline-flex cursor-default items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-2.5 transition hover:border-white/25 hover:bg-white/[0.07]">
      <span className="text-white">{icon}</span>
      <span className="text-left leading-tight">
        <span className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">{top}</span>
        <span className="block text-[15px] font-bold text-white">{bottom}</span>
      </span>
      <span className="ml-1 rounded-full bg-[#1d9bf0]/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#66b6ff]">
        Em breve
      </span>
    </span>
  );
}

const cmStyles = `
.cm-reveal { opacity: 0; transform: translateY(26px); transition: opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1); }
.cm-reveal.cm-in { opacity: 1; transform: none; }

.cm-orb { position: absolute; border-radius: 9999px; filter: blur(120px); pointer-events: none; z-index: 0;
  transform: translate(var(--px,0), var(--py,0)); transition: transform .5s ease-out; }
.cm-orb-a { top: -12%; left: 8%; width: 520px; height: 520px; background: rgba(29,155,240,.22); animation: cm-float 16s ease-in-out infinite; }
.cm-orb-b { top: 6%; right: 4%; width: 460px; height: 460px; background: rgba(139,92,246,.16); animation: cm-float 20s ease-in-out infinite reverse; }
@keyframes cm-float {
  0%,100% { translate: 0 0; }
  50% { translate: 30px 40px; }
}

.cm-shine {
  background: linear-gradient(90deg, #1d9bf0, #7cc0ff, #8b5cf6, #1d9bf0);
  background-size: 300% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: cm-shimmer 6s linear infinite;
}
@keyframes cm-shimmer { to { background-position: 300% 0; } }

.cm-cta { box-shadow: 0 10px 30px -8px rgba(29,155,240,.5); }
.cm-cta:hover { background: #3aa8f5; box-shadow: 0 16px 44px -10px rgba(29,155,240,.7); transform: translateY(-1px); }

.cm-marquee { animation: cm-marquee 28s linear infinite; }
@keyframes cm-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

.cm-glow::before {
  content: ""; position: absolute; inset: 0; z-index: -1;
  background: radial-gradient(circle at 50% 50%, rgba(29,155,240,.14), transparent 60%);
}

@media (prefers-reduced-motion: reduce) {
  .cm-reveal { opacity: 1; transform: none; transition: none; }
  .cm-orb, .cm-shine, .cm-marquee { animation: none; }
}
`;
