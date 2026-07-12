"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UploadCloud, FileText, ImagePlus, Check } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { MAGAZINE_CATEGORIES, MAGAZINE_PRICE, type Magazine } from "@/types/magazine";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 56);
}

type Props = { initial?: Magazine };

/** Formulário de criação/edição de revista (upload de capa e PDF). */
export default function MagazineForm({ initial }: Props) {
  const router = useRouter();
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [edition, setEdition] = useState(initial?.edition ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? MAGAZINE_PRICE));
  const [published, setPublished] = useState(initial?.published ?? false);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(initial?.cover_url ?? null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(initial?.pdf_path ? "PDF atual" : null);

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function onCover(f: File | null) {
    setCoverFile(f);
    if (f) setCoverPreview(URL.createObjectURL(f));
  }

  async function save() {
    if (!title.trim()) return setToast({ msg: "Informe o título.", ok: false });
    if (!isEdit && !pdfFile) return setToast({ msg: "Envie o PDF da revista.", ok: false });

    setBusy(true);
    setToast(null);
    try {
      const id = initial?.id ?? crypto.randomUUID();
      let coverUrl = initial?.cover_url ?? null;
      let pdfPath = initial?.pdf_path ?? null;

      // Upload da capa (bucket público)
      if (coverFile) {
        const ext = coverFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${id}/cover-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("magazine-covers").upload(path, coverFile, { upsert: true });
        if (error) throw new Error("Falha ao enviar a capa.");
        coverUrl = supabase.storage.from("magazine-covers").getPublicUrl(path).data.publicUrl;
      }

      // Upload do PDF (bucket privado)
      if (pdfFile) {
        const path = `${id}/${Date.now()}.pdf`;
        const { error } = await supabase.storage
          .from("magazine-pdfs")
          .upload(path, pdfFile, { upsert: true, contentType: "application/pdf" });
        if (error) throw new Error("Falha ao enviar o PDF.");
        pdfPath = path;
      }

      const row = {
        id,
        slug: initial?.slug ?? `${slugify(title)}-${id.slice(0, 4)}`,
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        description: description.trim() || null,
        edition: edition.trim() || null,
        category: category || null,
        price: Number(price.replace(",", ".")) || MAGAZINE_PRICE,
        cover_url: coverUrl,
        pdf_path: pdfPath,
        published,
        updated_at: new Date().toISOString(),
      };

      const { error } = isEdit
        ? await supabase.from("magazines").update(row).eq("id", id)
        : await supabase.from("magazines").insert(row);
      if (error) throw new Error(error.message);

      setToast({ msg: "Revista salva com sucesso.", ok: true });
      setTimeout(() => router.push("/admin/revistas"), 700);
    } catch (e) {
      setToast({ msg: e instanceof Error ? e.message : "Erro ao salvar.", ok: false });
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-[14px] text-zinc-900 outline-none transition focus:border-[#6D28D9]";
  const label = "mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-zinc-500";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <h1 className="mb-6 text-[24px] font-black tracking-tight text-zinc-900">
        {isEdit ? "Editar revista" : "Nova revista"}
      </h1>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        {/* Capa */}
        <div>
          <label className={label}>Capa</label>
          <label className="flex aspect-[3/4] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 transition hover:border-[#6D28D9]">
            {coverPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverPreview} alt="capa" className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-zinc-400">
                <ImagePlus size={26} />
                <span className="text-[12px] font-semibold">Enviar capa</span>
              </span>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onCover(e.target.files?.[0] ?? null)} />
          </label>
        </div>

        {/* Campos */}
        <div className="space-y-4">
          <div>
            <label className={label}>Título</label>
            <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Empreende Brasil" />
          </div>
          <div>
            <label className={label}>Subtítulo</label>
            <input className={input} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Uma linha de apoio" />
          </div>
          <div>
            <label className={label}>Descrição</label>
            <textarea className={`${input} min-h-[110px] resize-y`} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Nº da edição</label>
              <input className={input} value={edition} onChange={(e) => setEdition(e.target.value)} placeholder="Ex.: 01" />
            </div>
            <div>
              <label className={label}>Preço (R$)</label>
              <input className={input} value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" />
            </div>
          </div>
          <div>
            <label className={label}>Categoria</label>
            <select className={input} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Selecionar…</option>
              {MAGAZINE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* PDF */}
          <div>
            <label className={label}>PDF da revista</label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-3.5 transition hover:border-[#6D28D9]">
              {pdfFile || pdfName ? <FileText size={20} className="text-[#6D28D9]" /> : <UploadCloud size={20} className="text-zinc-400" />}
              <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-zinc-700">
                {pdfFile?.name || pdfName || "Enviar arquivo PDF"}
              </span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setPdfFile(f);
                  if (f) setPdfName(f.name);
                }}
              />
            </label>
          </div>

          {/* Publicado */}
          <label className="flex cursor-pointer items-center gap-3">
            <button
              type="button"
              onClick={() => setPublished((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition ${published ? "bg-[#6D28D9]" : "bg-zinc-300"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${published ? "left-[22px]" : "left-0.5"}`} />
            </button>
            <span className="text-[14px] font-semibold text-zinc-700">Publicado (visível na loja)</span>
          </label>

          <button
            onClick={save}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-[#6D28D9] px-7 py-3 text-[14px] font-bold text-white transition hover:bg-[#5b21b6] disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {busy ? "Salvando…" : "Salvar Revista"}
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-[13.5px] font-semibold text-white shadow-lg ${
            toast.ok ? "bg-[#6D28D9]" : "bg-red-600"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
