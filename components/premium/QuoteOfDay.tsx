"use client";

import { useState } from "react";
import { Share2, PlusCircle, Check, Loader2, Link2, MoreHorizontal, X } from "lucide-react";
import { createTextStory } from "@/lib/premium/stories";

// Frase do dia — muda automaticamente a cada dia (índice pelo dia do calendário).
const QUOTES: { t: string; a: string }[] = [
  { t: "O risco vem de não saber o que você está fazendo.", a: "Warren Buffett" },
  { t: "Preço é o que você paga; valor é o que você leva.", a: "Warren Buffett" },
  { t: "Quem não entende os juros, paga. Quem entende, recebe.", a: "Sabedoria financeira" },
  { t: "O melhor investimento que você pode fazer é em você mesmo.", a: "Warren Buffett" },
  { t: "Disciplina é a ponte entre metas e conquistas.", a: "Jim Rohn" },
  { t: "Não economize o que sobra depois de gastar; gaste o que sobra depois de poupar.", a: "Warren Buffett" },
  { t: "Conhecimento é o novo dinheiro: rende juros para a vida toda.", a: "Benjamin Franklin" },
  { t: "Um investimento em conhecimento paga os melhores juros.", a: "Benjamin Franklin" },
  { t: "Tempo no mercado vence acertar o tempo do mercado.", a: "Provérbio do investidor" },
  { t: "A informação é o ativo que mais valoriza com o tempo.", a: "Monatiza" },
  { t: "Quem lê mais, decide melhor.", a: "Monatiza" },
  { t: "Grandes resultados nascem de pequenos hábitos repetidos.", a: "James Clear" },
  { t: "A diversificação é a única proteção contra a própria ignorância.", a: "Sabedoria do mercado" },
  { t: "Pense em décadas, aja no presente.", a: "Provérbio do investidor" },
  { t: "Empreender é saltar do penhasco e montar o avião na queda.", a: "Reid Hoffman" },
  { t: "O dinheiro é um ótimo servo e um péssimo senhor.", a: "Francis Bacon" },
  { t: "Oportunidades não aparecem; são criadas.", a: "Chris Grosser" },
  { t: "Paciência é a companheira da sabedoria.", a: "Santo Agostinho" },
  { t: "Foque em ser produtivo, não apenas ocupado.", a: "Tim Ferriss" },
  { t: "Quem controla a própria atenção, controla o próprio futuro.", a: "Monatiza" },
  { t: "Invista primeiro em quem você quer se tornar.", a: "Sabedoria financeira" },
  { t: "O juro composto é a oitava maravilha do mundo.", a: "Albert Einstein (atribuído)" },
  { t: "Notícia boa é a que te faz pensar, não só reagir.", a: "Monatiza" },
  { t: "A persistência realiza o impossível.", a: "Provérbio chinês" },
  { t: "Construa sua reputação fazendo bem o que ninguém vê.", a: "Sabedoria do trabalho" },
];

export default function QuoteOfDay() {
  const day = Math.floor(Date.now() / 86_400_000);
  const q = QUOTES[((day % QUOTES.length) + QUOTES.length) % QUOTES.length];

  const [sheet, setSheet] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const text = `“${q.t}” — ${q.a} · via monatiza.com`;

  function done(msg: string) {
    setSheet(false);
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 2600);
  }

  async function toStory() {
    if (busy) return;
    setBusy(true);
    const ok = await createTextStory(`“${q.t}” — ${q.a}`, "brand");
    setBusy(false);
    if (ok) done("Publicada no seu story!");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      done("Frase copiada!");
    } catch {
      /* sem permissão de clipboard */
    }
  }

  async function nativeShare() {
    try {
      if (navigator.share) {
        await navigator.share({ text });
        setSheet(false);
      } else {
        await copy();
      }
    } catch {
      /* usuário cancelou */
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-7">
      <div className="pro-gradient pro-aura pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full opacity-25 blur-3xl" />
      <div className="relative">
        <p className="pro-gradient-text text-[11px] font-black uppercase tracking-[0.2em]">Frase do dia</p>
        <p className="mt-3 font-serif text-[20px] leading-snug text-white md:text-[24px]">“{q.t}”</p>
        <p className="mt-3 text-[13px] font-semibold text-zinc-400">— {q.a}</p>

        <div className="mt-4">
          {feedback ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-2 text-[12.5px] font-bold text-emerald-400">
              <Check size={14} /> {feedback}
            </span>
          ) : (
            <button
              onClick={() => setSheet(true)}
              className="pro-glass inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-bold text-zinc-100"
              aria-label="Compartilhar frase"
            >
              <Share2 size={14} /> Compartilhar
            </button>
          )}
        </div>
      </div>

      {/* bandeja de compartilhamento (estilo rede social) */}
      {sheet && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={() => setSheet(false)}
        >
          <div
            className="pro-pop w-full max-w-[420px] rounded-t-3xl border border-white/10 bg-[#101014] p-5 pb-7 sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[13px] font-black uppercase tracking-widest text-zinc-400">Compartilhar</p>
              <button onClick={() => setSheet(false)} className="text-zinc-400 hover:text-white" aria-label="Fechar">
                <X size={16} />
              </button>
            </div>
            <div className="flex items-start justify-around">
              <button onClick={toStory} disabled={busy} className="flex w-[76px] flex-col items-center gap-2 disabled:opacity-60">
                <span className="pro-gradient flex h-14 w-14 items-center justify-center rounded-full text-white">
                  {busy ? <Loader2 size={20} className="animate-spin" /> : <PlusCircle size={22} />}
                </span>
                <span className="text-center text-[11.5px] leading-tight text-zinc-300">Adicionar ao story</span>
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(text)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSheet(false)}
                className="flex w-[76px] flex-col items-center gap-2"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </span>
                <span className="text-center text-[11.5px] leading-tight text-zinc-300">WhatsApp</span>
              </a>
              <button onClick={copy} className="flex w-[76px] flex-col items-center gap-2">
                <span className="pro-glass flex h-14 w-14 items-center justify-center rounded-full text-zinc-100">
                  <Link2 size={22} />
                </span>
                <span className="text-center text-[11.5px] leading-tight text-zinc-300">Copiar</span>
              </button>
              <button onClick={nativeShare} className="flex w-[76px] flex-col items-center gap-2">
                <span className="pro-glass flex h-14 w-14 items-center justify-center rounded-full text-zinc-100">
                  <MoreHorizontal size={22} />
                </span>
                <span className="text-center text-[11.5px] leading-tight text-zinc-300">Mais</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
