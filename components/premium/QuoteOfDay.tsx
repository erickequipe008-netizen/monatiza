"use client";

import { useState } from "react";
import { Heart, Share2, Check } from "lucide-react";

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

  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);
  const text = `“${q.t}” — ${q.a} · via monatiza.com`;

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setShared(true);
      setTimeout(() => setShared(false), 2000);
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

        {/* ações só com ícones (estilo X) */}
        <div className="-ml-2 mt-3 flex items-center gap-1 text-zinc-400">
          <button
            onClick={() => setLiked((v) => !v)}
            className={`rounded-full p-2 transition hover:bg-[#E0263B]/10 ${liked ? "text-[#E0263B]" : "hover:text-[#E0263B]"}`}
            aria-label="Curtir frase"
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
          </button>
          <button
            onClick={share}
            className={`rounded-full p-2 transition hover:bg-[#9B72CB]/10 ${shared ? "text-emerald-400" : "hover:text-[#9B72CB]"}`}
            aria-label="Compartilhar frase"
          >
            {shared ? <Check size={18} /> : <Share2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
