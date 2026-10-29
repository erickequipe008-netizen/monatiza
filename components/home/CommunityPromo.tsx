"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

// Convite "da casa" para a comunidade/app. Visual claro e discreto — sem
// fundo azul, sem bolhas. Escondido para quem já está dentro do app.

export default function CommunityPromo({
  className = "",
  variant = "full",
}: {
  className?: string;
  variant?: "full" | "bar";
}) {
  const { isSubscriber, loading } = useSubscriber();
  if (loading || isSubscriber) return null;

  if (variant === "bar") {
    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-center sm:flex-row sm:text-left">
          <div className="min-w-0">
            <p className="text-[15px] font-black leading-tight text-zinc-950">Comunidade Monatiza</p>
            <p className="text-[13px] text-zinc-500">Notícias, publicações e debates de negócios em um só lugar.</p>
          </div>
          <Link
            href="/painel/cadastro"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-zinc-900 px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-black"
          >
            Acessar <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-10 text-center sm:px-10 sm:py-12">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-red-600">Comunidade Monatiza</span>

        <h3 className="mx-auto mt-4 max-w-2xl font-serif text-[26px] font-black leading-[1.12] tracking-tight text-zinc-950 sm:text-[32px]">
          Junte-se à maior comunidade de empresários independentes da Monatiza
        </h3>

        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-500">
          Publique conteúdo, amplie sua visibilidade e conecte-se com pessoas que realmente geram
          oportunidades.
        </p>

        <p className="mx-auto mt-3 text-[15px] font-bold text-zinc-900">
          Quem aparece, vende. Quem se posiciona, lidera.
        </p>

        <Link
          href="/painel/cadastro"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-8 py-3.5 text-[15px] font-bold text-white transition hover:bg-black"
        >
          Entrar na comunidade <ArrowUpRight size={17} />
        </Link>
      </div>
    </div>
  );
}
