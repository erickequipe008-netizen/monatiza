import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Mail, ShieldCheck } from "lucide-react";
import { getPublicMagazineBySlug } from "@/lib/magazines";
import { SITE_URL, SITE_NAME, SITE_LOGO, plainText, toISO } from "@/lib/seo";
import { formatPrice } from "@/types/magazine";
import BuyButton from "@/components/revista/BuyButton";

export const revalidate = 120;

export async function generateMetadata({
 params,
}: {
 params: Promise<{ slug: string }>;
}): Promise<Metadata> {
 const { slug } = await params;
 const m = await getPublicMagazineBySlug(slug);
 if (!m) return { title: "Revista — Monatiza" };
 const url = `${SITE_URL}/revista/${m.slug}`;
 const description = plainText(m.description || m.subtitle, 180) || `${m.title} — edição digital da Monatiza.`;
 const image = m.cover_url || SITE_LOGO;
 return {
 title: `${m.title} — Revista Monatiza`,
 description,
 alternates: { canonical: url },
 openGraph: {
 title: m.title,
 description,
 url,
 type: "book",
 images: [{ url: image }],
 },
 twitter: { card: "summary_large_image", title: m.title, description, images: [image] },
 };
}

export default async function MagazineDetail({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 const m = await getPublicMagazineBySlug(slug);
 if (!m) notFound();

 const url = `${SITE_URL}/revista/${m.slug}`;
 const jsonLd = {
 "@context": "https://schema.org",
 "@type": "Book",
 bookFormat: "https://schema.org/EBook",
 name: m.title,
 description: plainText(m.description || m.subtitle, 300),
 image: m.cover_url || SITE_LOGO,
 datePublished: toISO(m.created_at),
 inLanguage: "pt-BR",
 url,
 publisher: {
 "@type": "Organization",
 name: SITE_NAME,
 logo: { "@type": "ImageObject", url: SITE_LOGO },
 },
 offers: {
 "@type": "Offer",
 price: m.price.toFixed(2),
 priceCurrency: "BRL",
 availability: "https://schema.org/InStock",
 url,
 },
 };

 const date = new Date(toISO(m.created_at)).toLocaleDateString("pt-BR", {
 day: "2-digit",
 month: "long",
 year: "numeric",
 });

 return (
 <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
 <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

 <Link
 href="/revista"
 className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-zinc-500 transition hover:text-zinc-900"
 >
 <ArrowLeft size={15} /> Todas as edições
 </Link>

 <div className="grid gap-8 md:grid-cols-[minmax(0,340px)_1fr] md:gap-12">
 {/* Capa */}
 <div className="mx-auto w-full max-w-[320px] md:sticky md:top-8 md:self-start">
 <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-100 shadow-xl ring-1 ring-black/[0.06]">
 {m.cover_url ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img src={m.cover_url} alt={m.title} className="h-full w-full object-cover" />
 ) : null}
 </div>
 </div>

 {/* Detalhes */}
 <div>
 {m.category && (
 <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#dc2626]">{m.category}</span>
 )}
 <h1 className="mt-2 text-[30px] font-black leading-tight tracking-tight text-zinc-900 md:text-[40px]">
 {m.title}
 </h1>
 {m.subtitle && <p className="mt-2 text-[16px] leading-relaxed text-zinc-500">{m.subtitle}</p>}

 <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-zinc-500">
 {m.edition && <span>Edição {m.edition}</span>}
 {m.edition && <span className="text-zinc-300">·</span>}
 <span>Publicado em {date}</span>
 </div>

 {m.description && (
 <div className="mt-6 whitespace-pre-line text-[15.5px] leading-relaxed text-zinc-700">
 {m.description}
 </div>
 )}

 {/* Compra */}
 <div className="mt-8 rounded-2xl border border-black/[0.08] bg-white p-5">
 <div className="flex items-end justify-between">
 <div>
 <p className="text-[12px] font-semibold uppercase tracking-wide text-zinc-400">Edição digital · PDF</p>
 <p className="text-[30px] font-black tracking-tight text-zinc-900">{formatPrice(m.price)}</p>
 </div>
 </div>
 <div className="mt-4">
 <BuyButton magazineId={m.id} label="Comprar agora" size="lg" />
 </div>
 <ul className="mt-4 space-y-2 text-[13px] text-zinc-500">
 <li className="flex items-center gap-2"><Mail size={14} className="text-[#dc2626]" /> Enviada por e-mail após o pagamento</li>
 <li className="flex items-center gap-2"><Check size={14} className="text-[#dc2626]" /> Download imediato na tela de sucesso</li>
 <li className="flex items-center gap-2"><ShieldCheck size={14} className="text-[#dc2626]" /> Pagamento seguro via Stripe</li>
 </ul>
 </div>
 </div>
 </div>
 </div>
 );
}
