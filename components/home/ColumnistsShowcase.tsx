"use client";

import Link from "next/link";
import { PenLine, ArrowUpRight } from "lucide-react";

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
    line: "Comunicação que gera negócio na sua região",
  },
  {
    name: "Pedro Henrique",
    beat: "Tecnologia & Startups",
    img: "/colunistas/pedro-henrique.jpg",
    line: "Tecnologia e startups para além do eixo Rio–SP",
  },
  {
    name: "Fábio Martins",
    beat: "Esportes & Cultura",
    img: "/colunistas/fabio-martins.jpg",
    line: "Esporte e cultura com palco para novos nomes",
  },
];

/**
 * Friso de colunistas no topo da capa (estilo jornal): foto redonda, nome em
 * vermelho e o tema da coluna. Fecha com um convite para virar colunista.
 * Sem largura própria — herda o container da capa.
 */
export default function ColumnistsShowcase() {
  return (
    <section className="my-9 border-y border-zinc-200 py-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.18em] text-zinc-900">
          <span className="h-3.5 w-1 rounded-full" style={{ backgroundColor: RED }} />
          Colunistas
        </h2>
        <Link
          href="/colunistas"
          className="inline-flex items-center gap-1 text-[12px] font-bold text-zinc-500 transition hover:text-[#d81f2c]"
        >
          Ver todos <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNISTS.map((c) => (
          <Link
            key={c.name}
            href="/colunistas"
            className="group flex items-start gap-3.5 lg:border-l lg:border-zinc-100 lg:pl-6 lg:first:border-0 lg:first:pl-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.img}
              alt={c.name}
              loading="lazy"
              className="h-[54px] w-[54px] shrink-0 rounded-full object-cover ring-1 ring-zinc-200"
              style={{ objectPosition: "center 22%" }}
            />
            <div className="min-w-0">
              <span className="text-[9.5px] font-bold uppercase tracking-widest text-zinc-400">{c.beat}</span>
              <h3 className="text-[15px] font-black leading-tight tracking-tight" style={{ color: RED }}>
                {c.name}
              </h3>
              <p className="mt-0.5 line-clamp-2 font-serif text-[14px] leading-snug text-zinc-800">{c.line}</p>
            </div>
          </Link>
        ))}

        {/* Convite: seja colunista */}
        <Link
          href="/colunistas"
          className="group flex items-start gap-3.5 lg:border-l lg:border-zinc-100 lg:pl-6"
        >
          <span
            className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: RED }}
          >
            <PenLine size={22} />
          </span>
          <div className="min-w-0">
            <span className="text-[9.5px] font-bold uppercase tracking-widest text-zinc-400">Faça parte</span>
            <h3 className="text-[15px] font-black leading-tight tracking-tight text-zinc-900">Seja colunista</h3>
            <p className="mt-0.5 inline-flex items-center gap-1 text-[13px] font-bold" style={{ color: RED }}>
              Escreva na Monatiza <ArrowUpRight size={13} />
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
