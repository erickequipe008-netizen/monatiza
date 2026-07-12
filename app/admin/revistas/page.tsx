"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, BookOpen, DollarSign, Download, ShoppingCart, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { formatPrice, type Magazine, type MagazinePurchase } from "@/types/magazine";

export default function AdminMagazines() {
  const [mags, setMags] = useState<Magazine[]>([]);
  const [sales, setSales] = useState<MagazinePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<Magazine | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    const [m, s] = await Promise.all([
      supabase.from("magazines").select("*").order("created_at", { ascending: false }),
      supabase.from("magazine_purchases").select("*").eq("status", "paid").order("payment_date", { ascending: false }),
    ]);
    setMags((m.data as Magazine[]) ?? []);
    setSales((s.data as MagazinePurchase[]) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  const revenue = sales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const downloads = sales.filter((s) => s.download_sent).length;

  async function doDelete(m: Magazine) {
    setDeleting(true);
    try {
      if (m.pdf_path) await supabase.storage.from("magazine-pdfs").remove([m.pdf_path]);
      if (m.cover_url && m.cover_url.includes("/magazine-covers/")) {
        const path = m.cover_url.split("/magazine-covers/")[1];
        if (path) await supabase.storage.from("magazine-covers").remove([decodeURIComponent(path)]);
      }
      await supabase.from("magazines").delete().eq("id", m.id);
      setMags((prev) => prev.filter((x) => x.id !== m.id));
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[24px] font-black tracking-tight text-zinc-900">Revistas</h1>
        <Link
          href="/admin/revistas/nova"
          className="inline-flex items-center gap-2 rounded-full bg-[#6D28D9] px-4 py-2.5 text-[13.5px] font-bold text-white transition hover:bg-[#5b21b6]"
        >
          <Plus size={15} /> Nova revista
        </Link>
      </div>

      {/* Métricas */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric icon={BookOpen} label="Revistas" value={String(mags.length)} />
        <Metric icon={ShoppingCart} label="Vendas" value={String(sales.length)} />
        <Metric icon={DollarSign} label="Receita total" value={formatPrice(revenue)} />
        <Metric icon={Download} label="Downloads" value={String(downloads)} />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-100" />
          ))}
        </div>
      ) : mags.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center text-sm text-zinc-500">
          Nenhuma revista cadastrada. Clique em <b>Nova revista</b> para começar.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-[13.5px]">
            <thead className="bg-zinc-50 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Capa</th>
                <th className="px-4 py-3">Título</th>
                <th className="hidden px-4 py-3 sm:table-cell">Edição</th>
                <th className="hidden px-4 py-3 md:table-cell">Data</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {mags.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-50/60">
                  <td className="px-4 py-2.5">
                    <div className="h-12 w-9 overflow-hidden rounded bg-zinc-100">
                      {m.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.cover_url} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-zinc-900">{m.title}</td>
                  <td className="hidden px-4 py-2.5 text-zinc-500 sm:table-cell">{m.edition || "—"}</td>
                  <td className="hidden px-4 py-2.5 text-zinc-500 md:table-cell">
                    {new Date(m.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-700">{formatPrice(m.price)}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        m.published ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {m.published ? "Publicada" : "Rascunho"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/revistas/${m.id}`} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900" title="Editar">
                        <Pencil size={15} />
                      </Link>
                      <button onClick={() => setConfirm(m)} className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600" title="Excluir">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Últimas vendas */}
      {sales.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-[15px] font-extrabold text-zinc-900">Últimas vendas</h2>
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            {sales.slice(0, 8).map((s) => (
              <div key={s.id} className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-semibold text-zinc-900">{s.customer_name || s.customer_email}</p>
                  <p className="truncate text-[12px] text-zinc-500">{s.customer_email}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13.5px] font-bold text-zinc-900">{formatPrice(Number(s.amount))}</p>
                  <p className="text-[11px] text-zinc-400">
                    {s.payment_date ? new Date(s.payment_date).toLocaleDateString("pt-BR") : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de confirmação */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !deleting && setConfirm(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[17px] font-black text-zinc-900">Excluir revista?</h3>
            <p className="mt-2 text-[14px] text-zinc-500">
              “{confirm.title}” será removida do banco e os arquivos (capa e PDF) do armazenamento. Esta ação é permanente.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} disabled={deleting} className="rounded-full px-4 py-2 text-[13.5px] font-semibold text-zinc-600 hover:bg-zinc-100">
                Cancelar
              </button>
              <button
                onClick={() => doDelete(confirm)}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-[13.5px] font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />} Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center gap-2 text-zinc-400">
        <Icon size={15} />
        <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-[22px] font-black tracking-tight text-zinc-900">{value}</p>
    </div>
  );
}
