import Link from "next/link";
import type { MagazinePublic } from "@/types/magazine";

type Props = {
  magazines: MagazinePublic[];
  dark?: boolean;
};

export function MagazinesShowcase({ magazines, dark = false }: Props) {
  if (!magazines || magazines.length === 0) return null;

  const muted = dark ? "text-gray-400" : "text-gray-500";
  const border = dark ? "border-white/10" : "border-black/10";

  return (
    <section
      aria-labelledby="edicoes-monatiza"
      className={`mt-16 border-t pt-10 ${border}`}
    >
      {/* Cabeçalho */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span
              className="block h-[3px] w-6 bg-[#dc2626]"
              aria-hidden="true"
            />

            <h2
              id="edicoes-monatiza"
              className="text-xs font-black uppercase tracking-[0.18em] sm:text-sm"
            >
              Edições Monatiza
            </h2>
          </div>

          <p className={`text-xs sm:text-sm ${muted}`}>
            Explore nossas revistas e edições especiais.
          </p>
        </div>

        <Link
          href="/revista"
          className="shrink-0 text-xs font-semibold text-[#dc2626] hover:underline sm:text-sm"
        >
          Ver todas →
        </Link>
      </div>

      {/* Fileira horizontal de revistas */}
      <div
        className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 pt-2 scroll-smooth sm:gap-6 lg:gap-7"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {magazines.map((m) => (
          <Link
            key={m.id}
            href={`/revista/${m.slug}`}
            aria-label={`Abrir revista ${m.title}`}
            className="group block w-[165px] shrink-0 snap-start sm:w-[185px] md:w-[205px] lg:w-[220px] xl:w-[230px]"
          >
            {/* Capa */}
            <div
              className={`relative aspect-[3/4] w-full overflow-hidden rounded-xl border shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl ${border} ${
                dark ? "bg-[#171717]" : "bg-zinc-100"
              }`}
            >
              {m.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.cover_url}
                  alt={`Capa da revista ${m.title}`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-4 text-center">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${muted}`}
                  >
                    {m.title}
                  </span>
                </div>
              )}

              {/* Número da edição sobre a capa */}
              {m.edition && (
                <span className="absolute left-2.5 top-2.5 rounded-full bg-black/70 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                  Ed. {m.edition}
                </span>
              )}
            </div>

            {/* Informações */}
            <div className="mt-3">
              {m.category && (
                <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#dc2626]">
                  {m.category}
                </span>
              )}

              <h3 className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug tracking-tight group-hover:underline sm:text-[15px]">
                {m.title}
              </h3>

              {m.edition && (
                <span className={`mt-1 block text-xs ${muted}`}>
                  Edição {m.edition}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}