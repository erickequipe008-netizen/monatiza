import Link from "next/link";
import { BookOpen } from "lucide-react";
import { formatPrice, type MagazinePublic } from "@/types/magazine";
import BuyButton from "@/components/revista/BuyButton";

/** Card de revista no estilo Apple/Kindle: capa 3:4, título, edição, preço. */
export default function MagazineCard({ m }: { m: MagazinePublic }) {
  return (
    <div className="group flex flex-col">
      <Link
        href={`/revista/${m.slug}`}
        className="relative block aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-100 shadow-sm ring-1 ring-black/[0.06] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl dark:bg-zinc-900 dark:ring-white/10"
      >
        {m.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.cover_url}
            alt={m.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-300">
            <BookOpen size={48} />
          </div>
        )}
        {m.edition && (
          <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
            Ed. {m.edition}
          </span>
        )}
      </Link>

      <div className="mt-3.5 flex flex-1 flex-col">
        {m.category && (
          <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#6D28D9]">{m.category}</span>
        )}
        <Link href={`/revista/${m.slug}`} className="mt-1">
          <h3 className="line-clamp-2 text-[15.5px] font-extrabold leading-snug tracking-tight text-zinc-900 dark:text-white">
            {m.title}
          </h3>
        </Link>
        {m.subtitle && (
          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-zinc-500 dark:text-zinc-400">{m.subtitle}</p>
        )}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[15px] font-black tracking-tight text-zinc-900 dark:text-white">
            {formatPrice(m.price)}
          </span>
          <BuyButton magazineId={m.id} label="Comprar" size="sm" />
        </div>
      </div>
    </div>
  );
}
