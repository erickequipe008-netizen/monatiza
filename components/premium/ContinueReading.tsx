import Link from "next/link";
import { Crown } from "lucide-react";
import { toISO } from "@/lib/seo";

type Item = {
  id: string | number;
  slug: string;
  title: string;
  category?: string | null;
  image_url?: string | null;
  created_at?: string | null;
  is_premium?: boolean | null;
};

function timeAgo(dateStr?: string | null) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(toISO(dateStr)).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Agora mesmo";
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d atrás`;
  return new Date(toISO(dateStr)).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Grade "Continue lendo" no fim da matéria — mantém o leitor clicando de
 * uma matéria para a outra sem voltar. Os links navegam no cliente (sem
 * recarregar a página / sem precisar do botão voltar).
 */
export default function ContinueReading({ items }: { items: Item[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="border-t border-zinc-100 bg-zinc-50/60">
      <div className="mx-auto max-w-[1180px] px-4 py-12">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-5 w-1.5 rounded-full bg-red-600" />
          <h2 className="text-[20px] font-black uppercase tracking-wide text-zinc-900">
            Continue lendo
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <Link key={item.id} href={`/noticia/${item.slug}`} className="group flex flex-col">
              {item.image_url ? (
                <div className="w-full overflow-hidden rounded-xl" style={{ aspectRatio: "16/10" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-full rounded-xl bg-zinc-200" style={{ aspectRatio: "16/10" }} />
              )}
              <span className="mt-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-600">
                {item.category}
                {item.is_premium && <Crown size={10} className="text-[#0b0b0c]" />}
              </span>
              <h3 className="mt-1.5 text-[14.5px] font-bold leading-snug text-zinc-900 transition group-hover:text-red-600 line-clamp-3">
                {item.title}
              </h3>
              <span className="mt-2 text-[11px] text-zinc-400">{timeAgo(item.created_at)}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
