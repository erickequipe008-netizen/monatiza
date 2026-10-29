"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Smartphone,
  Sparkles,
  MapPin,
  PenSquare,
  Users,
  MessagesSquare,
  Compass,
  Newspaper,
  TrendingUp,
  Heart,
  MessageCircle,
  Repeat2,
  Check,
} from "lucide-react";

const FEATURES = [
  { icon: Newspaper, title: "Notícias em tempo real", desc: "Acompanhe os assuntos que impactam negócios, tecnologia, economia, política, inovação e muito mais." },
  { icon: PenSquare, title: "Compartilhe conhecimento", desc: "Publique ideias, experiências e projetos para ampliar sua presença profissional." },
  { icon: Users, title: "Conecte-se com profissionais", desc: "Siga pessoas, faça novas conexões e participe de conversas relevantes." },
  { icon: Compass, title: "Descubra oportunidades", desc: "Encontre empresas, parceiros, clientes e profissionais alinhados aos seus objetivos." },
  { icon: MessagesSquare, title: "Participe das discussões", desc: "Comente, responda e interaja com uma comunidade que valoriza conteúdo de qualidade." },
  { icon: TrendingUp, title: "Construa sua reputação", desc: "Quanto mais você participa, maior é a sua visibilidade dentro da plataforma." },
];

const STEPS = [
  { n: "01", t: "Crie sua conta", d: "Cadastre-se gratuitamente com seu e-mail ou conta Google." },
  { n: "02", t: "Escolha o que acompanhar", d: "Siga temas, empresas, pessoas e assuntos do seu interesse para personalizar seu feed." },
  { n: "03", t: "Participe da conversa", d: "Leia, publique, comente e conecte-se com pessoas que compartilham dos mesmos interesses." },
];

const POSTS = [
  {
    initial: "R", grad: "from-[#1d9bf0] to-[#8b5cf6]", name: "Rafael Nunes", handle: "rafanunes", verified: true, time: "2h",
    text: "Fechei um contrato de R$ 50 mil que começou com uma conversa aqui na comunidade. Networking de verdade muda o jogo. 🚀",
    likes: 128, comments: 34, reposts: 12,
  },
  {
    initial: "C", grad: "from-[#f59e0b] to-[#ef4444]", name: "Camila Duarte", handle: "camiladuarte", verified: false, time: "5h",
    text: "A nova regra do etanol na gasolina vai mexer com o custo de frota. Já revi minha operação de logística por causa da notícia de hoje.",
    likes: 89, comments: 21, reposts: 5,
  },
  {
    initial: "L", grad: "from-[#10b981] to-[#1d9bf0]", name: "Lucas Prado", handle: "lucasprado", verified: true, time: "1d",
    text: "Publiquei meu primeiro artigo sobre IA no varejo e em um dia alcancei mais gente do que em três meses de LinkedIn. Aqui a sua voz chega longe.",
    likes: 210, comments: 47, reposts: 30,
  },
];

const TICKER = ["Negócios", "IA", "Mercado", "Política", "Tech", "Startups", "Empreende", "Carreira", "Saúde", "Revista"];

const TRUST = [
  { icon: Smartphone, label: "Disponível para iPhone e Android" },
  { icon: Sparkles, label: "Gratuito para começar" },
  { icon: MapPin, label: "Feito no Brasil" },
];

export default function ComunidadeLanding() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      heroRef.current?.querySelectorAll<HTMLElement>(".cm-reveal").forEach((el) => el.classList.add("cm-in"))
    );
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div ref={rootRef} className="relative min-h-screen overflow-hidden bg-[#07070a] text-white">
      <style>{cmStyles}</style>

      <div className="cm-orb cm-orb-a" />
      <div className="cm-orb cm-orb-b" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(29,155,240,0.10),transparent_55%)]" />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative flex flex-col items-center px-5 pb-24 pt-24 text-center md:min-h-[88vh] md:justify-center md:pt-28">
        <span className="cm-reveal inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#66b6ff] backdrop-blur">
          <Users size={13} /> Comunidade Monatiza
        </span>

        <h1 className="cm-reveal mt-7 max-w-[15ch] text-[40px] font-black leading-[1.0] tracking-[-0.03em] sm:text-[60px] md:text-[74px]" style={{ transitionDelay: "80ms" }}>
          A comunidade onde notícias
          <br />
          <span className="cm-shine">viram conexões.</span>
        </h1>

        <p className="cm-reveal mt-7 max-w-[52ch] text-[16px] leading-relaxed text-zinc-400 sm:text-[18px]" style={{ transitionDelay: "160ms" }}>
          Acompanhe as notícias que movimentam o mercado, compartilhe suas ideias e conecte-se com
          empresários, profissionais e criadores em um único lugar. Informação, conversa e
          oportunidades, tudo em tempo real.
        </p>

        <div className="cm-reveal mt-10 flex w-full flex-col items-center justify-center gap-3 sm:flex-row" style={{ transitionDelay: "240ms" }}>
          <Link href="/painel/cadastro?next=/app" className="cm-cta group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1d9bf0] px-8 py-4 text-[15px] font-bold text-white transition sm:w-auto">
            Criar conta gratuitamente
            <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href="/app" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-8 py-4 text-[15px] font-bold text-white/90 transition hover:bg-white/[0.06] sm:w-auto">
            Entrar na comunidade
          </Link>
        </div>

        <div className="cm-reveal mt-6 flex flex-wrap items-center justify-center gap-3" style={{ transitionDelay: "320ms" }}>
          <StoreButton href="#" icon={<AppleMark />} top="Baixar na" bottom="App Store" />
          <StoreButton href="#" icon={<GooglePlayMark />} top="Disponível no" bottom="Google Play" />
        </div>

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

      {/* ── UMA NOVA FORMA ── */}
      <section className="relative mx-auto max-w-[820px] px-5 py-28 text-center md:py-36">
        <span className="cm-reveal text-[12px] font-black uppercase tracking-[0.28em] text-[#1d9bf0]">Sobre</span>
        <h2 className="cm-reveal mt-5 text-[30px] font-black leading-[1.12] tracking-tight md:text-[44px]" style={{ transitionDelay: "80ms" }}>
          Uma nova forma de acompanhar o que acontece.
        </h2>
        <p className="cm-reveal mx-auto mt-7 max-w-[54ch] text-[17px] font-semibold leading-relaxed text-zinc-300 md:text-[19px]" style={{ transitionDelay: "140ms" }}>
          As notícias não precisam terminar quando você fecha a matéria.
        </p>
        <p className="cm-reveal mx-auto mt-4 max-w-[56ch] text-[15.5px] leading-relaxed text-zinc-400 md:text-[16.5px]" style={{ transitionDelay: "200ms" }}>
          Na Comunidade Monatiza, elas dão início a conversas, análises e novas conexões. Você
          acompanha os principais acontecimentos, participa das discussões e compartilha sua visão
          com pessoas que também querem crescer.
        </p>
        <p className="cm-reveal mx-auto mt-4 max-w-[56ch] text-[15.5px] leading-relaxed text-zinc-400 md:text-[16.5px]" style={{ transitionDelay: "260ms" }}>
          Em vez de alternar entre diferentes aplicativos para ler notícias, fazer networking e
          publicar conteúdo, você encontra tudo reunido em uma única experiência.
        </p>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="relative mx-auto max-w-[1000px] px-5 pb-28 md:pb-36">
        <div className="mb-12 text-center">
          <span className="cm-reveal text-[12px] font-black uppercase tracking-[0.28em] text-[#1d9bf0]">Como funciona</span>
          <h2 className="cm-reveal mt-4 text-[28px] font-black tracking-tight md:text-[40px]" style={{ transitionDelay: "80ms" }}>Comece em poucos minutos.</h2>
        </div>
        <div className="grid gap-10 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.n} className="cm-reveal" style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="cm-shine text-[40px] font-black tracking-tight">{s.n}</span>
              <h3 className="mt-3 text-[18px] font-black tracking-tight">{s.t}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-zinc-500">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── O FEED (exemplos) ── */}
      <section className="relative mx-auto max-w-[600px] px-5 pb-28 md:pb-36">
        <div className="mb-10 text-center">
          <span className="cm-reveal text-[12px] font-black uppercase tracking-[0.28em] text-[#1d9bf0]">O feed</span>
          <h2 className="cm-reveal mt-4 text-[28px] font-black leading-[1.12] tracking-tight md:text-[40px]" style={{ transitionDelay: "80ms" }}>
            Um feed que conecta informação e pessoas.
          </h2>
          <p className="cm-reveal mx-auto mt-5 max-w-[48ch] text-[15px] leading-relaxed text-zinc-400" style={{ transitionDelay: "140ms" }}>
            Na Comunidade Monatiza, notícias e publicações aparecem lado a lado. Enquanto você
            acompanha os acontecimentos do dia, também descobre opiniões, experiências, análises e
            projetos compartilhados pela comunidade.
          </p>
          <p className="cm-reveal mx-auto mt-4 max-w-[42ch] text-[15px] font-semibold leading-relaxed text-zinc-300" style={{ transitionDelay: "200ms" }}>
            Cada publicação pode iniciar uma conversa. Cada conversa pode gerar uma nova oportunidade.
          </p>
        </div>
        <div className="space-y-4">
          {POSTS.map((p, i) => (
            <article key={p.handle} className="cm-reveal rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 text-left backdrop-blur-sm" style={{ transitionDelay: `${i * 90}ms` }}>
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${p.grad} text-[15px] font-black text-white`}>
                  {p.initial}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[14.5px] font-bold text-white">
                    {p.name}
                    {p.verified && (
                      <span className="inline-flex h-[15px] w-[15px] items-center justify-center rounded-full bg-[#1d9bf0] text-white">
                        <Check size={9} strokeWidth={4} />
                      </span>
                    )}
                    <span className="font-normal text-zinc-600">· {p.time}</span>
                  </p>
                  <p className="text-[13px] text-zinc-500">@{p.handle}</p>
                </div>
              </div>
              <p className="mt-3.5 text-[15px] leading-relaxed text-zinc-200">{p.text}</p>
              <div className="mt-4 flex items-center gap-7 text-zinc-500">
                <span className="flex items-center gap-1.5 text-[13px]"><Heart size={16} /> {p.likes}</span>
                <span className="flex items-center gap-1.5 text-[13px]"><MessageCircle size={16} /> {p.comments}</span>
                <span className="flex items-center gap-1.5 text-[13px]"><Repeat2 size={16} /> {p.reposts}</span>
              </div>
            </article>
          ))}
        </div>
        <p className="cm-reveal mt-8 text-center text-[13px] text-zinc-600">Exemplos ilustrativos da comunidade.</p>
      </section>

      {/* ── RECURSOS ── */}
      <section className="relative mx-auto max-w-[1040px] px-5 pb-28 md:pb-36">
        <div className="mb-12 text-center">
          <span className="cm-reveal text-[12px] font-black uppercase tracking-[0.28em] text-[#1d9bf0]">Recursos</span>
          <h2 className="cm-reveal mt-4 text-[28px] font-black tracking-tight md:text-[40px]" style={{ transitionDelay: "80ms" }}>Tudo o que você precisa em um só lugar.</h2>
        </div>
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

      {/* ── PARA QUEM É ── */}
      <section className="relative mx-auto max-w-[820px] px-5 pb-28 text-center md:pb-36">
        <span className="cm-reveal text-[12px] font-black uppercase tracking-[0.28em] text-[#1d9bf0]">Para quem é</span>
        <h2 className="cm-reveal mt-5 text-[28px] font-black leading-[1.14] tracking-tight md:text-[42px]" style={{ transitionDelay: "80ms" }}>
          Feita para quem quer acompanhar o mercado.
        </h2>
        <p className="cm-reveal mx-auto mt-6 max-w-[56ch] text-[15.5px] leading-relaxed text-zinc-400 md:text-[17px]" style={{ transitionDelay: "140ms" }}>
          A Comunidade Monatiza reúne pessoas interessadas em informação de qualidade, negócios,
          inovação, tecnologia, empreendedorismo e desenvolvimento profissional.
        </p>
        <p className="cm-reveal mx-auto mt-4 max-w-[56ch] text-[15.5px] leading-relaxed text-zinc-400 md:text-[17px]" style={{ transitionDelay: "200ms" }}>
          Seja para acompanhar as notícias do dia, compartilhar conhecimento ou criar novas conexões,
          você encontra um ambiente pensado para conversas relevantes.
        </p>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative px-5 pb-32 text-center">
        <div className="cm-glow relative mx-auto max-w-[720px] py-16">
          <h2 className="cm-reveal text-[32px] font-black leading-[1.06] tracking-tight md:text-[50px]">
            Entre para a <span className="cm-shine">Comunidade Monatiza.</span>
          </h2>
          <p className="cm-reveal mx-auto mt-6 max-w-[44ch] text-[16px] font-semibold leading-relaxed text-zinc-300" style={{ transitionDelay: "80ms" }}>
            A informação conecta pessoas. As pessoas criam oportunidades.
          </p>
          <p className="cm-reveal mx-auto mt-3 max-w-[46ch] text-[15px] leading-relaxed text-zinc-400" style={{ transitionDelay: "140ms" }}>
            Faça parte da comunidade que reúne notícias, conhecimento e networking em uma única plataforma.
          </p>
          <div className="cm-reveal mt-9 flex flex-col items-center gap-4" style={{ transitionDelay: "200ms" }}>
            <Link href="/painel/cadastro?next=/app" className="cm-cta group inline-flex items-center gap-2 rounded-full bg-[#1d9bf0] px-9 py-4 text-[15px] font-bold text-white transition">
              Criar conta gratuitamente
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <div className="flex items-center gap-3">
              <StoreButton href="#" icon={<AppleMark />} top="Baixar na" bottom="App Store" compact />
              <StoreButton href="#" icon={<GooglePlayMark />} top="Disponível no" bottom="Google Play" compact />
            </div>
            <p className="text-[13px] text-zinc-600">Disponível para iPhone e Android.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function StoreButton({ href, icon, top, bottom, compact }: { href: string; icon: React.ReactNode; top: string; bottom: string; compact?: boolean }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.04] transition hover:border-white/25 hover:bg-white/[0.08] ${compact ? "px-4 py-2" : "px-5 py-2.5"}`}
    >
      <span className="text-white">{icon}</span>
      <span className="text-left leading-tight">
        <span className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">{top}</span>
        <span className="block text-[15px] font-bold text-white">{bottom}</span>
      </span>
    </Link>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path d="M17.564 13.02c-.024-2.5 2.042-3.7 2.135-3.757-1.163-1.7-2.973-1.933-3.616-1.958-1.54-.156-3.006.907-3.787.907-.78 0-1.98-.884-3.256-.86-1.677.025-3.223.975-4.086 2.475-1.742 3.022-.446 7.5 1.248 9.955.828 1.203 1.816 2.552 3.11 2.504 1.246-.05 1.716-.807 3.223-.807 1.507 0 1.93.807 3.256.783 1.343-.025 2.195-1.227 3.017-2.435.95-1.397 1.34-2.75 1.362-2.82-.03-.013-2.612-1.003-2.638-3.978M15.09 5.62c.69-.836 1.155-2 1.028-3.156-.994.04-2.196.662-2.908 1.496-.638.74-1.197 1.92-1.047 3.053 1.108.086 2.238-.563 2.927-1.393" />
    </svg>
  );
}

function GooglePlayMark() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="23" aria-hidden="true">
      <path fill="#00d2ff" d="M3.6 1.84C3.24 2.03 3 2.4 3 2.9v18.2c0 .5.24.87.6 1.06l10.2-10.16z" />
      <path fill="#00e676" d="M3.6 1.84 17.8 8.02 14.4 11.4z" />
      <path fill="#ffce00" d="M14.4 11.4 17.8 8.02l2.83 1.58c1.3.74 1.3 2.06 0 2.8L17.8 13.98z" />
      <path fill="#ff3b30" d="m3.6 22.16 10.8-10.76 3.4 3.38-14.2 7.38z" />
    </svg>
  );
}

const cmStyles = `
.cm-reveal { opacity: 0; transform: translateY(26px); transition: opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1); }
.cm-reveal.cm-in { opacity: 1; transform: none; }

.cm-orb { position: absolute; border-radius: 9999px; filter: blur(120px); pointer-events: none; z-index: 0;
  transform: translate(var(--px,0), var(--py,0)); transition: transform .5s ease-out; }
.cm-orb-a { top: -12%; left: 8%; width: 520px; height: 520px; background: rgba(29,155,240,.22); animation: cm-float 16s ease-in-out infinite; }
.cm-orb-b { top: 6%; right: 4%; width: 460px; height: 460px; background: rgba(139,92,246,.16); animation: cm-float 20s ease-in-out infinite reverse; }
@keyframes cm-float { 0%,100% { translate: 0 0; } 50% { translate: 30px 40px; } }

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
