import Link from "next/link";
import { Signal, Wifi, BatteryFull, ChevronLeft, Bell, Search } from "lucide-react";

const IG_URL = "https://instagram.com/monatizabrazil";

const HIGHLIGHTS = ["Newsletter", "Play", "Histórias", "Info", "Mercado"];

/**
 * "A Monatiza no Instagram": o perfil do @monatizabrazil recriado DENTRO de
 * um mockup de celular (tema escuro, como no app), com os dados reais e as
 * capas das matérias na grade. Recebe as URLs das capas.
 */
export default function InstagramSection({ images = [] }: { images?: string[] }) {
  const tiles = images.filter(Boolean).slice(0, 9);

  return (
    <section className="border-t border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-10 px-4 py-14 md:grid-cols-2 md:gap-8 md:py-20">
        {/* Texto + CTA */}
        <div className="order-2 md:order-1">
          <p className="text-[12px] font-black uppercase tracking-[0.2em] text-red-600">Instagram</p>
          <h2 className="mt-3 text-[36px] font-black leading-[1.03] tracking-tight text-zinc-950 sm:text-[46px]">
            a Monatiza no seu feed
          </h2>
          <p className="mt-4 max-w-md text-[16px] leading-relaxed text-zinc-500">
            Já são <b className="text-zinc-900">118 mil seguidores</b> acompanhando as notícias de negócios,
            IA e economia todos os dias. Siga <b className="text-zinc-900">@monatizabrazil</b>.
          </p>
          <Link
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-red-600 px-7 py-3.5 text-[15px] font-bold text-white transition hover:bg-red-700"
          >
            Seguir no Instagram
          </Link>
        </div>

        {/* Perfil do Instagram dentro do celular */}
        <div className="order-1 flex justify-center md:order-2">
          <div className="relative">
            <div className="absolute inset-x-6 top-8 bottom-0 rounded-[48px] bg-zinc-100" aria-hidden="true" />
            <div className="relative mx-auto w-[300px] rounded-[44px] bg-zinc-900 p-2.5 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.55)]">
              <div className="overflow-hidden rounded-[34px] bg-black text-white">
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

                {/* header do perfil */}
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

                  {/* botões */}
                  <div className="mt-3 flex gap-1.5">
                    <span className="flex-1 rounded-lg bg-zinc-800 py-1.5 text-center text-[12px] font-bold">Seguindo</span>
                    <span className="flex-1 rounded-lg bg-zinc-800 py-1.5 text-center text-[12px] font-bold">Mensagem</span>
                    <span className="rounded-lg bg-zinc-800 px-3 py-1.5 text-center text-[12px] font-bold">Loja</span>
                  </div>

                  {/* destaques */}
                  <div className="mt-4 flex justify-between">
                    {HIGHLIGHTS.map((h) => (
                      <div key={h} className="flex w-[52px] flex-col items-center gap-1">
                        <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-zinc-900 text-[10px] font-black text-zinc-500 ring-1 ring-zinc-700">
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
                  <Search size={15} />
                </div>

                {/* grade de posts */}
                <div className="grid grid-cols-3 gap-0.5">
                  {tiles.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <div key={i} className="aspect-square overflow-hidden bg-zinc-800">
                      <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
