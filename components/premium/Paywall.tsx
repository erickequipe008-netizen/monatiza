"use client";

import Link from "next/link";
import { Crown, Check, Lock } from "lucide-react";

const BENEFITS = [
  "Acesso ilimitado e sem anúncios",
  "Conteúdo e séries exclusivas",
  "Mais alcance e reconhecimento na comunidade",
  "Revista Monatiza e newsletter premium",
];

/**
 * Bloqueio elegante para conteúdo premium (visitante).
 * Mostra um leve "fade" sobre a prévia + chamada para assinar.
 *
 * `floating` desenha o degradê que cobre o final da prévia (uso no artigo);
 * desligue (`floating={false}`) quando o paywall não fica logo após um texto.
 */
export default function Paywall({ floating = true }: { floating?: boolean }) {
  return (
    <div className="relative">
      {floating && (
        <div className="pointer-events-none absolute -top-40 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-white" />
      )}

      <div className="relative rounded-2xl border border-zinc-200 bg-white px-6 py-10 sm:px-12 sm:py-12 text-center shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)]">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#0b0b0c] px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-white">
          <Crown size={13} className="text-[#E0263B]" /> Conteúdo MonatizaPlus
        </span>

        <h2 className="mx-auto mt-6 max-w-xl font-serif text-[26px] sm:text-[34px] font-black leading-[1.12] tracking-tight text-[#0b0b0c]">
          Continue lendo com o MonatizaPlus.
        </h2>

        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-zinc-500">
          Jornalismo com profundidade, sem anúncios — e mais alcance e
          reconhecimento para o seu perfil na comunidade.
        </p>

        <ul className="mx-auto mt-7 flex max-w-md flex-col gap-2.5 text-left">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-3 text-[14px] text-zinc-700">
              <Check size={18} strokeWidth={3} className="mt-[1px] shrink-0 text-[#E0263B]" />
              {b}
            </li>
          ))}
        </ul>

        <Link
          href="/assinantes"
          className="mt-8 inline-flex w-full max-w-xs items-center justify-center gap-2 bg-[#E0263B] px-8 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:bg-[#b91d2f]"
        >
          Assinar agora
        </Link>

        <p className="mt-5 flex items-center justify-center gap-1.5 text-[13px] text-zinc-500">
          <Lock size={13} className="text-zinc-400" />
          Já é assinante?{" "}
          <Link href="/painel/login" className="font-bold text-[#0b0b0c] underline-offset-2 hover:text-[#E0263B] hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
