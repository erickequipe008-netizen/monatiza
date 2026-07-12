"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, PenLine, ArrowUpRight } from "lucide-react";

const RED = "#d81f2c";

type Columnist = {
  name: string;
  beat: string;
  img: string;
  line: string;
};

const COLUMNISTS: Columnist[] = [
  {
    name: "Luciana Paula",
    beat: "Comunicação & Negócios",
    img: "/colunistas/luciana-paula.jpg",
    line: "Comunicação não é falar, é impactar — cada coluna é uma conversa com a minha região.",
  },
  {
    name: "Pedro Henrique",
    beat: "Tecnologia & Startups",
    img: "/colunistas/pedro-henrique.jpg",
    line: "Cubro lançamentos de tecnologia e startups no interior, com quem conhece o terreno.",
  },
  {
    name: "Fábio Martins",
    beat: "Esportes & Cultura",
    img: "/colunistas/fabio-martins.jpg",
    line: "De peças teatrais a campeonatos amadores, dou palco a quem ainda não tinha vitrine.",
  },
];

// Nº de "páginas" do carrossel = colunistas + o card final "Seja colunista".
const TOTAL = COLUMNISTS.length + 1;

export default function ColumnistsShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function scrollToIndex(i: number) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[i] as HTMLElement | undefined;
    if (card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
  }

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    const first = track.children[0] as HTMLElement | undefined;
    if (!first) return;
    const step = first.clientWidth + 20; // largura do card + gap
    setActive(Math.min(TOTAL - 1, Math.round(track.scrollLeft / step)));
  }

  const go = (dir: -1 | 1) => scrollToIndex(Math.max(0, Math.min(TOTAL - 1, active + dir)));

  return (
    <section className="mx-auto max-w-[1180px] px-4 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="text-[30px] font-black tracking-tight text-zinc-950 sm:text-[36px]">Colunistas</h2>
        <Link
          href="/colunistas"
          className="hidden shrink-0 items-center gap-1 text-[13px] font-bold text-zinc-500 transition hover:text-[#d81f2c] sm:inline-flex"
        >
          Ver programa <ArrowUpRight size={15} />
        </Link>
      </div>

      {/* Carrossel */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {COLUMNISTS.map((c) => (
          <Link
            key={c.name}
            href="/colunistas"
            className="group flex w-[82%] shrink-0 snap-start items-start gap-4 rounded-2xl border border-zinc-100 bg-white p-4 transition hover:border-zinc-200 hover:shadow-[0_16px_40px_-24px_rgba(0,0,0,0.35)] sm:w-[46%] lg:w-[31.5%]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.img}
              alt={c.name}
              loading="lazy"
              className="h-[92px] w-[92px] shrink-0 rounded-2xl object-cover"
              style={{ objectPosition: "center 22%" }}
            />
            <div className="min-w-0">
              <span className="text-[10.5px] font-bold uppercase tracking-widest text-zinc-400">{c.beat}</span>
              <h3
                className="mt-0.5 text-[18px] font-black leading-tight tracking-tight transition"
                style={{ color: RED }}
              >
                {c.name}
              </h3>
              <p className="mt-1.5 line-clamp-3 text-[14px] leading-snug text-zinc-800">{c.line}</p>
            </div>
          </Link>
        ))}

        {/* Card de conversão: seja colunista */}
        <Link
          href="/colunistas"
          className="group flex w-[82%] shrink-0 snap-start flex-col justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-6 text-center transition hover:border-[#d81f2c]/40 sm:w-[46%] lg:w-[31.5%]"
        >
          <span
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-white"
            style={{ backgroundColor: RED }}
          >
            <PenLine size={22} />
          </span>
          <h3 className="text-[17px] font-black tracking-tight text-zinc-950">Escreva na Monatiza</h3>
          <p className="text-[13.5px] leading-snug text-zinc-500">
            Publique suas colunas com o apoio da nossa Redação e alcance todo o Brasil.
          </p>
          <span
            className="mx-auto mt-1 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-black text-white"
            style={{ backgroundColor: RED }}
          >
            Seja colunista <ArrowUpRight size={15} />
          </span>
        </Link>
      </div>

      {/* Controles do carrossel */}
      <div className="mt-5 flex items-center justify-center gap-4">
        <button
          onClick={() => go(-1)}
          aria-label="Anterior"
          disabled={active === 0}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:text-zinc-900 disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <button
              key={i}
              aria-label={`Ir para ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className="h-2 rounded-full transition-all"
              style={{
                width: active === i ? 22 : 8,
                backgroundColor: active === i ? RED : "#d4d4d8",
              }}
            />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          aria-label="Próximo"
          disabled={active === TOTAL - 1}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:text-zinc-900 disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
