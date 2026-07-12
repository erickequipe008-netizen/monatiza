import Link from "next/link";

const IG_URL = "https://instagram.com/monatizabrazil";

function IgGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

/**
 * Seção "Siga a Monatiza no Instagram" — perfil com os dados reais do
 * @monatizabrazil e uma grade com as capas das matérias (como no feed).
 * Recebe as URLs das imagens da capa.
 */
export default function InstagramSection({ images = [] }: { images?: string[] }) {
  const tiles = images.filter(Boolean).slice(0, 6);

  return (
    <section className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-[1180px] px-4 py-14">
        <div className="overflow-hidden rounded-3xl border border-zinc-200">
          {/* Cabeçalho do perfil */}
          <div className="flex flex-col items-center gap-5 p-6 text-center sm:flex-row sm:gap-7 sm:p-8 sm:text-left">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-black font-serif text-[34px] font-black text-white ring-1 ring-zinc-200">
              m
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
                <span className="inline-flex items-center gap-2 text-[19px] font-black tracking-tight text-zinc-950">
                  <IgGlyph className="text-zinc-500" />
                  monatizabrazil
                </span>
                <Link
                  href={IG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-6 py-2 text-[13px] font-bold text-white transition hover:bg-black"
                >
                  Seguir
                </Link>
              </div>
              <div className="mt-3 flex items-center justify-center gap-6 text-[13.5px] text-zinc-600 sm:justify-start">
                <span>
                  <b className="text-zinc-950">1.076</b> posts
                </span>
                <span>
                  <b className="text-zinc-950">118 mil</b> seguidores
                </span>
                <span>
                  <b className="text-zinc-950">180</b> seguindo
                </span>
              </div>
              <p className="mx-auto mt-3 max-w-md text-[14px] leading-snug text-zinc-700 sm:mx-0">
                O principal veículo sobre negócios do Brasil 🇧🇷 — notícias, IA e a nossa Revista, todos
                os dias.
              </p>
            </div>
          </div>

          {/* Grade de posts (capas das matérias) */}
          {tiles.length > 0 && (
            <div className="grid grid-cols-3 gap-1">
              {tiles.map((src, i) => (
                <Link
                  key={i}
                  href={IG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square overflow-hidden bg-zinc-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
