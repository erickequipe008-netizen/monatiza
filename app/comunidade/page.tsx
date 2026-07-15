import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  PenSquare,
  Users,
  MessagesSquare,
  Compass,
  Heart,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Comunidade Monatiza — a rede social de quem faz negócio",
  description:
    "A rede social da Monatiza reúne empresários, criadores e profissionais para publicar, debater e crescer — junto com as notícias que movem o mercado. Grátis, para sempre.",
  alternates: { canonical: "https://www.monatiza.com/comunidade" },
};

const FEATURES = [
  {
    icon: PenSquare,
    title: "Publique e seja lido",
    desc: "Compartilhe ideias, aprendizados e bastidores do seu negócio. Aqui a sua experiência vira conteúdo — e o conteúdo vira autoridade.",
  },
  {
    icon: Users,
    title: "Construa a sua rede",
    desc: "Siga pessoas, ganhe seguidores e se cerque de quem também empreende. Conexões de verdade abrem portas de verdade.",
  },
  {
    icon: MessagesSquare,
    title: "Converse em tempo real",
    desc: "Comentários, respostas e mensagens diretas. Tire dúvidas, feche parcerias e troque com quem entende do seu mundo.",
  },
  {
    icon: Compass,
    title: "Descubra o que importa",
    desc: "Um feed que junta as notícias da Monatiza com o que a comunidade está discutindo agora — sem ruído, no seu ritmo.",
  },
  {
    icon: Heart,
    title: "Engajamento que soma",
    desc: "Curtidas, salvamentos e debates saudáveis. Uma comunidade que reconhece boas ideias e eleva quem contribui.",
  },
  {
    icon: TrendingUp,
    title: "Cresça de verdade",
    desc: "Quem aparece, vende. Quem se posiciona, lidera. Aqui a sua voz alcança mais gente e o seu nome ganha peso.",
  },
];

export default function ComunidadePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-950">
      {/* ── HERO (painel escuro representa o app) ── */}
      <section className="mx-auto max-w-[1080px] px-4 pt-12 md:pt-16">
        <div className="overflow-hidden rounded-[28px] bg-[#0b0b0f] px-6 py-16 text-center text-white md:px-10 md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#1d9bf0]">
            <Users size={13} /> Comunidade Monatiza
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-[36px] font-black leading-[1.02] tracking-tight md:text-[58px]">
            A rede social de quem faz{" "}
            <span className="text-[#1d9bf0]">negócio acontecer</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-relaxed text-zinc-300 md:text-[18px]">
            Um lugar para empresários, criadores e profissionais publicarem, debaterem e crescerem —
            lado a lado com as notícias que movem o mercado. Você acompanha o que importa, mostra o seu
            trabalho e se conecta com gente que gera oportunidade de verdade.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/painel/cadastro?next=/app"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1d9bf0] px-8 py-4 text-[15px] font-bold text-white transition hover:bg-[#1a8cd8] sm:w-auto"
            >
              Criar conta grátis <ArrowRight size={16} />
            </Link>
            <Link
              href="/app"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 text-[15px] font-bold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Acessar a comunidade
            </Link>
          </div>
          <p className="mt-5 text-[12.5px] text-zinc-500">
            Grátis para sempre · sem cartão · leva 1 minuto para entrar.
          </p>
        </div>
      </section>

      {/* ── O QUE É (explicativo, premium) ── */}
      <section className="mx-auto max-w-[820px] px-4 py-16 text-center md:py-24">
        <span className="text-[12px] font-black uppercase tracking-[0.25em] text-[#1d9bf0]">O que é</span>
        <h2 className="mt-4 font-serif text-[28px] font-black leading-[1.15] tracking-tight md:text-[40px]">
          Não é mais uma rede social. É a sua sala de negócios.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-zinc-500 md:text-[17px]">
          A maioria das redes foi feita para passar o tempo. A Comunidade Monatiza foi feita para fazer
          o tempo render: aqui você se informa, se posiciona e conhece as pessoas certas — tudo no
          mesmo lugar, sem barulho e sem algoritmo brigando pela sua atenção.
        </p>
      </section>

      {/* ── O QUE VOCÊ PODE FAZER ── */}
      <section className="mx-auto max-w-[1080px] px-4 pb-4 md:px-5">
        <div className="mb-9 flex items-center gap-3">
          <h2 className="text-[22px] font-black tracking-tight md:text-[28px]">Tudo o que você faz por aqui</h2>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#1d9bf0] text-white">
                <f.icon size={22} strokeWidth={2.2} />
              </span>
              <h3 className="mt-4 text-[17px] font-black">{f.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAIXA: é grátis ── */}
      <section className="mx-auto max-w-[1080px] px-4 py-16 md:py-20">
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-6 py-12 text-center md:px-10">
          <span className="text-[12px] font-black uppercase tracking-[0.25em] text-[#1d9bf0]">Grátis para sempre</span>
          <h2 className="mx-auto mt-4 max-w-xl text-[26px] font-black leading-tight tracking-tight md:text-[34px]">
            Entrar não custa nada. Ficar de fora, sim.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-zinc-500">
            Criar sua conta, publicar, seguir, comentar e conversar é 100% gratuito. Cada dia fora é
            uma conexão, um cliente e uma oportunidade que passam sem você ver.
          </p>
          <Link
            href="/painel/cadastro?next=/app"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#1d9bf0] px-8 py-4 text-[15px] font-bold text-white transition hover:bg-[#1a8cd8]"
          >
            Criar conta grátis <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="border-t border-zinc-200 bg-[#0b0b0f] text-white">
        <div className="mx-auto max-w-[1080px] px-4 py-16 text-center">
          <h2 className="text-[28px] font-black tracking-tight md:text-[38px]">Sua vez de aparecer</h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-zinc-400">
            Junte-se à maior comunidade de empresários independentes da Monatiza.
          </p>
          <Link
            href="/app"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#1d9bf0] px-8 py-4 text-[15px] font-bold text-white transition hover:bg-[#1a8cd8]"
          >
            Acessar a comunidade <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
