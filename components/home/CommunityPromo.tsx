"use client";

import Link from "next/link";
import { ArrowUpRight, Rocket, Plus } from "lucide-react";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

// Anúncio "da casa": convida o visitante a assinar e entrar na comunidade.
// Aparece no lugar de um anúncio do feed — escondido para quem já é assinante.

const PEOPLE = [
  { n: "A", g: "linear-gradient(120deg,#4285F4,#9B72CB)" },
  { n: "R", g: "linear-gradient(120deg,#9B72CB,#FF5C8A)" },
  { n: "J", g: "linear-gradient(120deg,#FF5C8A,#FF8A5C)" },
  { n: "C", g: "linear-gradient(120deg,#6D5BFF,#C56CFF)" },
];

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
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0f] px-5 py-4">
          <div className="pointer-events-none absolute -left-16 top-0 h-32 w-32 rounded-full bg-[#9B72CB]/30 blur-2xl" />
          <div className="pointer-events-none absolute -right-12 bottom-0 h-32 w-32 rounded-full bg-[#FF2D87]/25 blur-2xl" />
          <div className="relative flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[16px] font-black text-white"
              style={{ backgroundImage: "linear-gradient(120deg,#9B72CB,#FF2D87)" }}
            >
              m
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-black leading-tight text-white">
                Junte-se à{" "}
                <span style={{ backgroundImage: "linear-gradient(120deg,#C56CFF,#FF2D87)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                  Comunidade
                </span>{" "}
                de assinantes
              </p>
              <p className="text-[12.5px] text-zinc-400">Publique, debata e tenha mais alcance no MonatizaPlus.</p>
            </div>
            <Link
              href="/assinantes"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-bold text-white"
              style={{ backgroundImage: "linear-gradient(120deg,#9B72CB,#FF2D87)" }}
            >
              Assinar <Rocket size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0f] px-6 py-8 text-center sm:px-10 sm:py-10">
        {/* brilhos */}
        <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-[#9B72CB]/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#FF2D87]/25 blur-3xl" />

        <div className="relative mx-auto max-w-[560px]">
          {/* pílula superior */}
          <div className="mx-auto mb-6 flex items-center justify-between gap-3 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 backdrop-blur">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[14px] font-black text-white"
              style={{ backgroundImage: "linear-gradient(120deg,#9B72CB,#FF2D87)" }}
            >
              m
            </span>
            <div className="text-left leading-tight">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">Acesse agora</p>
              <p className="text-[13px] font-bold text-white">monatiza.com</p>
            </div>
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-white"
              style={{ backgroundImage: "linear-gradient(120deg,#9B72CB,#FF2D87)" }}
            >
              <ArrowUpRight size={16} />
            </span>
          </div>

          <p className="text-[18px] font-semibold text-zinc-200 sm:text-[20px]">Junte-se à nossa</p>
          <h3 className="mt-1 text-[32px] font-black leading-[0.95] tracking-tight sm:text-[42px]">
            <span
              style={{
                backgroundImage: "linear-gradient(120deg,#C56CFF,#FF2D87)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Comunidade
            </span>
            <br />
            <span className="text-white">de assinantes</span>
          </h3>

          {/* pílula "faça parte" */}
          <div
            className="mx-auto mt-6 flex max-w-[460px] items-center justify-center gap-4 rounded-full p-2 pr-6"
            style={{ backgroundImage: "linear-gradient(120deg,#7C3AED,#FF2D87)" }}
          >
            <div className="flex items-center">
              {PEOPLE.map((p, i) => (
                <span
                  key={i}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-black/40 text-[13px] font-black text-white ${i ? "-ml-3" : ""}`}
                  style={{ backgroundImage: p.g }}
                >
                  {p.n}
                </span>
              ))}
              <span className="-ml-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-black/40 bg-black text-white">
                <Plus size={16} />
              </span>
            </div>
            <span className="text-left text-[15px] font-bold leading-tight text-white">
              Faça parte
              <br />
              da comunidade
            </span>
          </div>

          <p className="mx-auto mt-6 max-w-[440px] text-[15px] leading-relaxed text-zinc-300">
            Assine o MonatizaPlus e entre na comunidade: publique suas ideias, debata com
            outros assinantes e tenha mais alcance e reconhecimento.
          </p>

          <Link
            href="/assinantes"
            className="mt-7 inline-flex items-center gap-2 rounded-full px-8 py-4 text-[15px] font-black text-white shadow-[0_18px_50px_-15px_rgba(255,45,135,0.6)] transition hover:opacity-90"
            style={{ backgroundImage: "linear-gradient(120deg,#9B72CB,#FF2D87)" }}
          >
            Tornar-se assinante <Rocket size={17} />
          </Link>
        </div>
      </div>
    </div>
  );
}
