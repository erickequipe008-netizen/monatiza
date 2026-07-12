"use client";

import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

/**
 * Seção de newsletter no fim da capa: manchete + captura de e-mail à
 * esquerda, prévia da edição num celular à direita. Fundo branco e
 * minimalista, identidade Monatiza. O e-mail é salvo em newsletter_signups.
 */
export default function NewsletterHero() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) {
      setState("error");
      return;
    }
    setState("loading");
    const { error } = await supabase
      .from("newsletter_signups")
      .insert({ email: email.trim().toLowerCase(), source: "home" });
    // e-mail repetido (unique) também é sucesso do ponto de vista do usuário
    if (error && !String(error.code).includes("23505") && !/duplicate/i.test(error.message)) {
      setState("error");
      return;
    }
    setState("done");
  }

  return (
    <section className="border-t border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-10 px-4 py-14 md:grid-cols-2 md:gap-8 md:py-20">
        {/* Texto + captura */}
        <div className="order-2 md:order-1">
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-red-600">Newsletter gratuita</p>
          <h2 className="mt-3 text-[40px] font-black leading-[0.98] tracking-tight text-zinc-950 sm:text-[52px]">
            <span className="text-red-600">à frente do mercado</span>
            <br />
            em 5 minutos
          </h2>
          <p className="mt-4 max-w-md text-[16px] leading-relaxed text-zinc-500">
            As notícias de <span className="font-semibold text-zinc-800">negócios, IA e economia</span> que
            realmente importam — direto no seu e-mail, de graça, toda manhã.
          </p>

          {state === "done" ? (
            <div className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-emerald-50 px-5 py-3.5 text-[15px] font-bold text-emerald-700">
              <Check size={18} strokeWidth={3} /> Pronto! Você está na lista.
            </div>
          ) : (
            <form onSubmit={subscribe} className="mt-7 max-w-md">
              <div className="flex items-center gap-2 rounded-full border border-zinc-300 bg-white p-1.5 pl-4 transition focus-within:border-zinc-900">
                <Mail size={18} className="shrink-0 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (state === "error") setState("idle");
                  }}
                  placeholder="coloque seu e-mail"
                  className="w-full bg-transparent text-[15px] text-zinc-900 outline-none placeholder:text-zinc-400"
                />
                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-[14px] font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                >
                  {state === "loading" ? <Loader2 size={16} className="animate-spin" /> : null}
                  inscreva-se
                </button>
              </div>
              {state === "error" && (
                <p className="mt-2 pl-4 text-[13px] font-semibold text-red-600">Digite um e-mail válido.</p>
              )}
            </form>
          )}
        </div>

        {/* Celular com a prévia da edição */}
        <div className="order-1 flex justify-center md:order-2">
          <div className="relative">
            {/* fundo neutro discreto atrás do aparelho */}
            <div className="absolute inset-x-6 top-8 bottom-0 rounded-[48px] bg-zinc-100" aria-hidden="true" />
            <div className="relative mx-auto w-[266px] rounded-[42px] bg-zinc-900 p-2.5 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.5)]">
              <div className="overflow-hidden rounded-[32px] bg-white">
                {/* notch + status bar */}
                <div className="relative flex items-center justify-between px-5 pt-3 pb-2">
                  <div className="absolute left-1/2 top-2 h-4 w-20 -translate-x-1/2 rounded-full bg-zinc-900" />
                  <span className="text-[10px] font-bold text-zinc-900">06:06</span>
                  <span className="text-[10px] font-semibold text-zinc-500">edição de hoje</span>
                </div>
                {/* conteúdo da newsletter */}
                <div className="px-4 pb-6">
                  <div className="rounded-xl bg-red-600 px-4 py-3">
                    <p className="font-serif text-[15px] font-black tracking-tight text-white">
                      monatiza <span className="font-sans text-[11px] font-semibold opacity-75">· newsletter</span>
                    </p>
                  </div>
                  <h4 className="mt-4 font-serif text-[19px] font-black tracking-tight text-zinc-950">bom dia.</h4>
                  <p className="mt-2 text-[12px] leading-relaxed text-zinc-600">
                    O que move os negócios hoje, sem enrolação: as decisões, os números e as ideias que valem
                    o seu tempo.
                  </p>
                  <div className="mt-4 border-t border-zinc-100 pt-3">
                    <p className="text-[9.5px] font-black uppercase tracking-widest text-zinc-400">Na edição de hoje</p>
                    <ul className="mt-2.5 space-y-2 text-[12px] leading-snug text-zinc-800">
                      <li>📈 O setor que mais contratou no trimestre</li>
                      <li>🤖 A ferramenta de IA que caiu no gosto das PMEs</li>
                      <li>💸 Para onde o dinheiro esperto está indo agora</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
