import { Signal, Wifi, BatteryFull, ChevronLeft, Bell } from "lucide-react";

const HIGHLIGHTS = ["Newsletter", "Play", "Histórias", "Info", "Mercado"];

/**
 * Tela do perfil do @monatizabrazil no Instagram (tema escuro), para exibir
 * dentro de um mockup de celular. Recebe as URLs das capas para a grade.
 */
export default function IgPhoneScreen({ images = [] }: { images?: string[] }) {
  const tiles = images.filter(Boolean).slice(0, 9);

  return (
    <div className="bg-black text-white">
      {/* status bar */}
      <div className="relative flex items-center justify-between px-5 pt-3 pb-1">
        <div className="absolute left-1/2 top-2 h-4 w-16 -translate-x-1/2 rounded-full bg-black ring-1 ring-zinc-800" />
        <span className="text-[10px] font-bold">11:09</span>
        <span className="flex items-center gap-1">
          <Signal size={11} />
          <Wifi size={11} />
          <BatteryFull size={15} />
        </span>
      </div>

      {/* header */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="flex items-center gap-1.5">
          <ChevronLeft size={17} />
          <span className="text-[15px] font-black tracking-tight">monatizabrazil</span>
        </span>
        <span className="flex items-center gap-3 text-zinc-300">
          <Bell size={16} />
          <span className="text-[17px] leading-none">⋯</span>
        </span>
      </div>

      {/* topo do perfil */}
      <div className="px-4">
        <div className="flex items-center gap-5">
          <div className="flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-full bg-black font-serif text-[26px] font-black text-white ring-2 ring-zinc-600">
            m
          </div>
          <div className="flex flex-1 justify-around text-center">
            <div>
              <div className="text-[15px] font-black leading-none">1.076</div>
              <div className="mt-1 text-[11px] text-zinc-400">posts</div>
            </div>
            <div>
              <div className="text-[15px] font-black leading-none">118 mil</div>
              <div className="mt-1 text-[11px] text-zinc-400">seguidores</div>
            </div>
            <div>
              <div className="text-[15px] font-black leading-none">180</div>
              <div className="mt-1 text-[11px] text-zinc-400">seguindo</div>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-[13px] font-bold">Monatiza</p>
          <p className="mt-0.5 text-[12px] leading-snug text-zinc-300">
            O principal veículo sobre negócios do Brasil 🇧🇷
          </p>
          <p className="text-[12px] text-sky-400">bio.monatiza.com</p>
        </div>

        <div className="mt-3 flex gap-1.5">
          <span className="flex-1 rounded-lg bg-zinc-800 py-1.5 text-center text-[12px] font-bold">Seguindo</span>
          <span className="flex-1 rounded-lg bg-zinc-800 py-1.5 text-center text-[12px] font-bold">Mensagem</span>
          <span className="rounded-lg bg-zinc-800 px-3 py-1.5 text-center text-[12px] font-bold">Loja</span>
        </div>

        <div className="mt-4 flex justify-between">
          {HIGHLIGHTS.map((h) => (
            <div key={h} className="flex w-[52px] flex-col items-center gap-1">
              <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-zinc-900 text-[11px] font-black text-zinc-500 ring-1 ring-zinc-700">
                {h[0]}
              </span>
              <span className="truncate text-[9px] text-zinc-400">{h}</span>
            </div>
          ))}
        </div>
      </div>

      {/* tabs */}
      <div className="mt-3 flex items-center justify-around border-t border-zinc-800 py-2 text-zinc-500">
        <span className="grid grid-cols-3 gap-0.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="h-[3px] w-[3px] bg-white" />
          ))}
        </span>
        <span className="h-[13px] w-[13px] rounded-[3px] border border-zinc-500" />
      </div>

      {/* grade de posts */}
      <div className="grid grid-cols-3 gap-0.5 pb-1">
        {tiles.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <div key={i} className="aspect-square overflow-hidden bg-zinc-800">
            <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
