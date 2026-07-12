"use client";

import Link from "next/link";
import { Crown, Check } from "lucide-react";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

const RED = "#E0263B";

const BENEFITS = [
  "Acesso a todo o conteúdo premium — colunas, séries e Revista Monatiza",
  "Leitura ilimitada e sem anúncios",
  "Comentar, curtir e opinar na comunidade",
  "Mais alcance e reconhecimento no seu perfil",
];

/**
 * Card de conversão no fim da matéria (visitante não-assinante).
 * Estrutura de venda com dois planos — anual (recomendado) e mensal — na
 * identidade da Monatiza. Assinante ativo não vê nada.
 */
export default function SubscribeCTA() {
  const { loading, isSubscriber } = useSubscriber();
  if (loading || isSubscriber) return null;

  return (
    <section className="mt-12 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)]">
      <div className="px-6 py-8 sm:px-10 sm:py-10">
        {/* Selo */}
        <span
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white"
          style={{ backgroundColor: RED }}
        >
          <Crown size={22} />
        </span>

        <h2 className="mt-5 font-serif text-[26px] font-black leading-[1.1] tracking-tight text-[#0b0b0c] sm:text-[32px]">
          Continue lendo e faça parte
        </h2>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-zinc-600">
          Para ler tudo sem limites, comentar e participar da conversa, assine o{" "}
          <b className="text-[#0b0b0c]">MonatizaPlus</b>.
        </p>

        {/* Benefícios */}
        <p className="mt-6 text-[14px] font-bold text-zinc-900">Só quem é assinante tem:</p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-3 text-[14px] text-zinc-700">
              <span
                className="mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: RED }}
              >
                <Check size={13} strokeWidth={3} className="text-white" />
              </span>
              {b}
            </li>
          ))}
        </ul>

        {/* Planos */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {/* Anual — recomendado */}
          <div
            className="relative overflow-hidden rounded-2xl border-2 bg-white"
            style={{ borderColor: RED }}
          >
            <span
              className="absolute right-[-34px] top-[16px] rotate-45 px-10 py-1 text-[10px] font-black uppercase tracking-wider text-white"
              style={{ backgroundColor: RED }}
            >
              Recomendado
            </span>
            <div className="p-5" style={{ backgroundColor: "#FEF3F4" }}>
              <p className="text-[13px] font-bold text-zinc-700">Plano anual</p>
              <div className="mt-1 flex items-end gap-1">
                <span className="text-[15px] font-bold text-zinc-500">R$</span>
                <span className="text-[38px] font-black leading-none tracking-tight text-[#0b0b0c]">199</span>
                <span className="mb-1 text-[15px] font-bold text-zinc-500">/ano</span>
              </div>
              <p className="mt-1 text-[12px] font-semibold text-zinc-500">
                equivale a R$ 16,58/mês · economize 2 meses
              </p>
            </div>
            <div className="p-4">
              <Link
                href="/assinar?plano=anual"
                className="flex w-full items-center justify-center rounded-full px-6 py-3.5 text-[15px] font-black text-white transition hover:brightness-110"
                style={{ backgroundColor: RED }}
              >
                Assinar agora
              </Link>
            </div>
          </div>

          {/* Mensal */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <div className="p-5">
              <p className="text-[13px] font-bold text-zinc-700">Plano mensal</p>
              <div className="mt-1 flex items-end gap-1">
                <span className="text-[15px] font-bold text-zinc-500">R$</span>
                <span className="text-[38px] font-black leading-none tracking-tight text-[#0b0b0c]">19,90</span>
                <span className="mb-1 text-[15px] font-bold text-zinc-500">/mês</span>
              </div>
              <p className="mt-1 text-[12px] font-semibold text-zinc-500">
                cancele quando quiser
              </p>
            </div>
            <div className="mt-auto p-4">
              <Link
                href="/assinar?plano=mensal"
                className="flex w-full items-center justify-center rounded-full border-2 border-zinc-900 bg-zinc-900 px-6 py-3.5 text-[15px] font-black text-white transition hover:bg-black"
              >
                Experimente 7 dias grátis
              </Link>
            </div>
          </div>
        </div>

        {/* Rodapé do card */}
        <div className="mt-6 flex flex-col items-center gap-2 text-center">
          <Link href="/termos" className="text-[13px] text-zinc-500 underline underline-offset-2 hover:text-zinc-800">
            Consulte o regulamento
          </Link>
          <Link
            href="/painel/login"
            className="text-[15px] font-black text-[#0b0b0c] underline underline-offset-2 hover:text-[#E0263B]"
          >
            Já sou assinante
          </Link>
        </div>
      </div>
    </section>
  );
}
