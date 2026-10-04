import Link from "next/link";

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  description?: string | null;
  image_url?: string | null;
  image?: string | null;
  category?: string | null;
};

type Props = {
  title: string;
  href: string;
  articles: Article[];
  dark?: boolean;
};

export function CategorySection({
  title,
  href,
  articles,
  dark = false,
}: Props) {
  if (!articles || articles.length === 0) return null;

  const featured = articles[0];

  // 3 matérias na coluna central
  const secondary = articles.slice(1, 4);

  // 3 chamadas na coluna direita
  const list = articles.slice(4, 7);

  const featuredImage = featured.image_url || featured.image;

  const muted = dark
    ? "text-zinc-400"
    : "text-zinc-600";

  const border = dark
    ? "border-white/10"
    : "border-black/10";

  return (
    <section className={`mt-16 border-t pt-8 ${border}`}>

      {/* CABEÇALHO */}
      <div className="mb-7 flex items-center justify-between gap-4">

        <div className="flex items-center gap-3">
          <span className="h-7 w-[4px] bg-[#dc2626]" />

          <h2 className="text-xl font-black tracking-tight sm:text-2xl">
            {title}
          </h2>
        </div>

        <Link
          href={href}
          className="text-xs font-bold text-[#dc2626] hover:underline sm:text-sm"
        >
          Ver mais →
        </Link>
      </div>

      {/* CONTEÚDO DA EDITORIA */}
      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.45fr_1fr_0.85fr]">

        {/* MATÉRIA PRINCIPAL */}
        <article>
          <Link
            href={`/noticia/${featured.slug}`}
            className="group block"
          >
            {featuredImage && (
              <div className="aspect-[16/9] overflow-hidden rounded-lg bg-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredImage}
                  alt={featured.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            )}

            <h3 className="mt-4 text-xl font-black leading-tight tracking-tight group-hover:underline sm:text-2xl">
              {featured.title}
            </h3>

            {(featured.excerpt || featured.description) && (
              <p
                className={`mt-2 line-clamp-3 text-sm leading-relaxed ${muted}`}
              >
                {featured.excerpt || featured.description}
              </p>
            )}
          </Link>
        </article>

        {/* 3 MATÉRIAS CENTRAIS */}
        <div className={`divide-y ${border}`}>
          {secondary.map((article) => {
            const image =
              article.image_url || article.image;

            return (
              <article
                key={article.id}
                className="py-4 first:pt-0"
              >
                <Link
                  href={`/noticia/${article.slug}`}
                  className="group grid grid-cols-[1fr_110px] gap-4"
                >
                  <div>
                    <h3 className="text-base font-bold leading-snug group-hover:underline">
                      {article.title}
                    </h3>

                    {(article.excerpt ||
                      article.description) && (
                      <p
                        className={`mt-2 line-clamp-2 text-xs leading-relaxed ${muted}`}
                      >
                        {article.excerpt ||
                          article.description}
                      </p>
                    )}
                  </div>

                  {image && (
                    <div className="aspect-square overflow-hidden rounded-md bg-zinc-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt={article.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                </Link>
              </article>
            );
          })}
        </div>

        {/* 3 CHAMADAS À DIREITA */}
        <div
          className={`divide-y border-t lg:border-l lg:border-t-0 lg:pl-6 ${border}`}
        >
          {list.map((article) => (
            <article
              key={article.id}
              className="py-5 first:pt-0"
            >
              <Link
                href={`/noticia/${article.slug}`}
                className="group block"
              >
                <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.15em] text-[#dc2626]">
                  {title}
                </span>

                <h3 className="text-sm font-bold leading-snug group-hover:underline">
                  {article.title}
                </h3>
              </Link>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}