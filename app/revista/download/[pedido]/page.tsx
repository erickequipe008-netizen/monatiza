import Link from "next/link";
import { CheckCircle2, Download, XCircle, Mail } from "lucide-react";
import { fulfillMagazineSession } from "@/lib/magazine-fulfill";
import { formatPrice } from "@/types/magazine";

export const dynamic = "force-dynamic";
export const metadata = { title: "Download da revista — Monatiza", robots: { index: false } };

export default async function DownloadPage({ params }: { params: Promise<{ pedido: string }> }) {
 const { pedido } = await params;
 const r = await fulfillMagazineSession(pedido).catch(() => ({ paid: false as const }));

 if (!r.paid) {
 return (
 <Shell>
 <XCircle size={46} className="text-red-500" />
 <h1 className="mt-4 text-[22px] font-black tracking-tight text-zinc-900">Pagamento não localizado</h1>
 <p className="mt-2 text-[14px] text-zinc-500">
 Ainda não encontramos a confirmação deste pedido. Se você acabou de pagar, aguarde alguns instantes e recarregue
 a página. O link de download também chega no seu e-mail.
 </p>
 <Link href="/revista" className="mt-6 inline-block rounded-full bg-zinc-900 px-6 py-3 text-[14px] font-bold text-white">
 Voltar à loja
 </Link>
 </Shell>
 );
 }

 const title = r.magazine?.title ?? "Sua revista";
 return (
 <Shell>
 <CheckCircle2 size={48} className="text-[#dc2626]" />
 <h1 className="mt-4 text-[24px] font-black tracking-tight text-zinc-900">Pagamento aprovado! 🎉</h1>
 <p className="mt-2 text-[14.5px] text-zinc-500">
 Sua compra foi confirmada. Baixe abaixo — também enviamos o link para <b>{r.email || "o seu e-mail"}</b>.
 </p>

 <div className="mt-6 w-full rounded-2xl border border-black/[0.08] bg-zinc-50 p-4 text-left">
 <p className="text-[15px] font-extrabold text-zinc-900">{title}</p>
 {r.magazine?.edition && <p className="text-[12.5px] text-zinc-500">Edição {r.magazine.edition}</p>}
 <p className="mt-1 text-[12.5px] text-zinc-500">Valor pago: {formatPrice(r.amount)}</p>
 </div>

 <a
 href={`/api/revista/download/${pedido}`}
 className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#dc2626] px-7 py-3.5 text-[15px] font-bold text-white transition hover:bg-[#b91c1c]"
 >
 <Download size={18} /> Baixar Revista
 </a>

 <p className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-zinc-400">
 <Mail size={12} /> O link é seguro e expira em 15 minutos — volte aqui para gerar outro.
 </p>
 </Shell>
 );
}

function Shell({ children }: { children: React.ReactNode }) {
 return (
 <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center md:py-24">{children}</div>
 );
}
