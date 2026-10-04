"use client";

type CommercialAdData = {
  id: number;
  position: number;
  name: string;
  desktop_image_url: string | null;
  mobile_image_url: string | null;
  target_url: string | null;
  active: boolean;
};

type Props = {
  ad?: CommercialAdData | null;
};

export function CommercialAd({ ad }: Props) {
  // Se não existir, estiver desativado ou não tiver nenhuma arte,
  // não aparece nada e não deixa espaço vazio.
  if (
    !ad ||
    !ad.active ||
    (!ad.desktop_image_url && !ad.mobile_image_url)
  ) {
    return null;
  }

  const content = (
    <div className="group relative w-full overflow-hidden rounded-xl">
      <picture>
        {ad.mobile_image_url && (
          <source
            media="(max-width: 639px)"
            srcSet={ad.mobile_image_url}
          />
        )}

        {ad.desktop_image_url && (
          <source
            media="(min-width: 640px)"
            srcSet={ad.desktop_image_url}
          />
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            ad.desktop_image_url ||
            ad.mobile_image_url ||
            ""
          }
          alt={ad.name || "Publicidade"}
          loading="lazy"
          decoding="async"
          className="
            block
            w-full
            max-h-[420px]
            object-cover
            transition-transform
            duration-500
            group-hover:scale-[1.01]
          "
        />
      </picture>

      <span className="absolute right-2 top-2 rounded bg-black/55 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">
        Publicidade
      </span>
    </div>
  );

  return (
    <aside
      aria-label="Publicidade"
      className="my-10 w-full sm:my-12"
    >
      {ad.target_url ? (
        <a
          href={ad.target_url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-label={`Publicidade: ${ad.name}`}
          className="block"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </aside>
  );
}

export type { CommercialAdData };