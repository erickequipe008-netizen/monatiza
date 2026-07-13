import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  PenSquare,
  Users,
  MessagesSquare,
  Compass,
  BadgeCheck,
  Newspaper,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Comunidade Monatiza — a rede social de quem faz negócio",
  description:
    "A rede social da Monatiza é gratuita: publique, conecte-se e cresça entre empresários, criadores e profissionais. Selo de verificação e MonatizaPlus são opcionais.",
  alternates: { canonical: "https://www.monatiza.com/comunidade" },
};

const FEATURES = [
  { icon: PenSquare, title: "Publique de graça", desc: "Compartilhe ideias, notícias e bastidores do seu negócio para toda a comunidade." },
  { icon: Users, title: "Conecte-se", desc: "Siga pessoas, ganhe seguidores e construa sua rede com quem gera oportunidade de verdade." },
  { icon: MessagesSquare, title: "Converse", desc: "Mensagens diretas, comentários e debates — tudo em tempo real." },
  { icon: Compass, title: "Descubra", desc: "Um feed que mistura as notícias da Monatiza com o que a comunidade está falando." },
  { icon: Newspaper, title: "Notícias no seu ritmo", desc: "As matérias de negócios, IA e economia direto na sua timeline." },
  { icon: Sparkles, title: "Cresça", desc: "Quem aparece, vende. Quem se posiciona, lidera. Aqui a sua voz alcança mais gente." },
];

export default function ComunidadePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-950">
      {/* ── HERO (painel escuro representa o app) ── */}
      <section className="mx-auto max-w-[1080px] px-4 pt-12 md:pt-16">
        <div className="overflow-hidden rounded-[28px] bg-[#0b0b0f] px-6 py-14 text-center text-white md:px-10 md:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#1d9bf0]">
            <Users size={13} /> Comunidade Monatiza
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-[36px] font-black leading-[1.02] tracking-tight md:text-[56px]">
            A rede social de quem faz{" "}
            <span className="text-[#1d9bf0]">negócio acontecer</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-zinc-300 md:text-[17px]">
            Publique, conecte-se e cresça entre empresários, criadores e profissionais — junto com as
            notícias da Monatiza. É <b className="text-white">grátis</b>.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/painel/cadastro"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1d9bf0] px-7 py-3.5 text-[15px] font-bold text-white transition hover:bg-[#1a8cd8] sm:w-auto"
            >
              Criar conta grátis <ArrowRight size={16} />
            </Link>
            <Link
              href="/app"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-[15px] font-bold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Acessar a comunidade
            </Link>
          </div>
          <p className="mt-4 text-[12.5px] text-zinc-500">Sem cartão. Sem mensalidade. Leva 1 minuto.</p>
        </div>
      </section>

      {/* ── O QUE VOCÊ PODE FAZER ── */}
      <section className="mx-auto max-w-[1080px] px-4 py-16 md:py-20">
        <div className="mb-9 flex items-center gap-3">
          <h2 className="text-[22px] font-black tracking-tight md:text-[28px]">Tudo o que dá pra fazer</h2>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#1d9bf0] text-white">
                <f.icon size={22} strokeWidth={2.2} />
              </span>
              <h3 className="mt-4 text-[17px] font-black">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── GRÁTIS × OPCIONAL ── */}
      <section className="mx-auto max-w-[1080px] px-4 pb-16 md:pb-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Grátis */}
          <div className="rounded-2xl border-2 border-[#1d9bf0] bg-[#1d9bf0]/[0.04] p-7 md:col-span-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#1d9bf0]">Sempre grátis</span>
            <h3 className="mt-2 text-[22px] font-black tracking-tight">A rede social</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Criar conta, publicar, seguir, comentar, mandar mensagem e acompanhar as notícias. Sem pagar nada.
            </p>
            <Link
              href="/painel/cadastro"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1d9bf0] px-6 py-3 text-[14px] font-bold text-white transition hover:bg-[#1a8cd8]"
            >
              Entrar grátis <ArrowRight size={15} />
            </Link>
          </div>

          {/* Opcionais (pagos) */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:col-span-2">
            <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-7">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-white">
                <BadgeCheck size={20} />
              </span>
              <h3 className="mt-4 text-[18px] font-black">Selo de verificação</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-500">
                Opcional. Mostra que o seu perfil é autêntico e dá mais credibilidade e destaque.
              </p>
              <Link href="/app/verificacao" className="mt-4 text-[13px] font-bold text-zinc-900 underline underline-offset-2 hover:text-[#1d9bf0]">
                Como conseguir o selo
              </Link>
            </div>

            <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-7">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white">
                <Newspaper size={20} />
              </span>
              <h3 className="mt-4 text-[18px] font-black">MonatizaPlus</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-500">
                Opcional. Assine para ler todas as matérias completas, navegar sem anúncios e baixar as revistas de graça.
              </p>
              <Link href="/assinantes" className="mt-4 text-[13px] font-bold text-zinc-900 underline underline-offset-2 hover:text-red-600">
                Ver a assinatura
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-[1080px] px-4 py-14 text-center">
          <h2 className="text-[26px] font-black tracking-tight md:text-[34px]">Sua vez de aparecer</h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-zinc-500">
            Junte-se à maior comunidade de empresários independentes da Monatiza.
          </p>
          <Link
            href="/painel/cadastro"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0b0b0f] px-8 py-3.5 text-[15px] font-bold text-white transition hover:bg-black"
          >
            Criar minha conta grátis <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
