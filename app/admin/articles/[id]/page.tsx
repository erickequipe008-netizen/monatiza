"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2, ArrowLeft, Check } from "lucide-react";
import { RichEditor, ImageDropZone } from "@/components/editor/ArticleEditor";
import { sanitizeArticleHtml } from "@/lib/sanitizeHtml";

const CATEGORIES = [
  "Negócios",
  "Tecnologia",
  "IA",
  "Mercado",
  "Brasil",
  "Política",
  "Saúde",
  "Empreende",
  "Startups",
  "Carreira",
  "Revista",
];

const cardCls = "bg-white border border-[#e5e5e5] rounded-2xl overflow-hidden";
const headCls = "px-5 py-3.5 border-b border-[#e5e5e5] bg-[#fafafa] flex items-center justify-between";
const cardLabelCls = "text-[11px] font-bold uppercase tracking-[0.1em] text-[#0b0b0c]";
const labelCls = "block text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-1.5";
const inputCls =
  "w-full rounded-xl border border-[#e5e5e5] bg-white px-3.5 py-2.5 text-sm text-[#0b0b0c] outline-none focus:border-[#0b0b0c] transition";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Negócios");
  const [status, setStatus] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [content, setContent] = useState("");
  const [ready, setReady] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data: row } = await supabase
        .from("articles")
        .select("id, title, slug, description, category, image_url, is_premium, status")
        .eq("id", id)
        .maybeSingle();
      if (!row) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setTitle(row.title || "");
      setDescription(row.description || "");
      setCategory(row.category || "Negócios");
      setStatus(row.status || "");
      setIsPremium(!!row.is_premium);
      setImagePreview(row.image_url || null);
      // corpo vem pela função protegida (SELECT de content é revogado)
      const { data: body } = await supabase.rpc("get_article_body", { p_slug: row.slug });
      setContent(sanitizeArticleHtml((body as string) || ""));
      setReady(true);
      setLoading(false);
    })();
  }, [id]);

  function handleImageChange(file: File) {
    setImageFile(file);
    const r = new FileReader();
    r.onloadend = () => setImagePreview(r.result as string);
    r.readAsDataURL(file);
  }

  async function uploadCover(): Promise<string | null> {
    if (!imageFile) return null;
    const ext = imageFile.name.split(".").pop();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const path = `covers/${user?.id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("articles").upload(path, imageFile);
    if (upErr) {
      setError("Erro ao enviar imagem: " + upErr.message);
      return null;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("articles").getPublicUrl(path);
    return publicUrl;
  }

  async function save(publish: boolean) {
    setError("");
    if (!title.trim()) {
      setError("O título é obrigatório.");
      return;
    }
    setSaving(true);

    let imageUrl: string | null;
    if (imageFile) {
      imageUrl = await uploadCover();
      if (!imageUrl) {
        setSaving(false);
        return;
      }
    } else {
      // mantém a capa atual (URL hospedada) ou nulo se foi removida
      imageUrl = imagePreview && imagePreview.startsWith("http") ? imagePreview : null;
    }

    const patch: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim(),
      content: sanitizeArticleHtml(content),
      category,
      image_url: imageUrl,
      is_premium: isPremium,
    };
    if (publish) patch.status = "publicado";

    const { error: upErr } = await supabase.from("articles").update(patch).eq("id", id);
    setSaving(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    router.push(status === "em_analise" ? "/admin/aprovacao" : "/admin/articles");
  }

  if (loading) return <div className="p-8 text-sm text-zinc-400">Carregando…</div>;
  if (notFound)
    return (
      <div className="p-8">
        <p className="text-sm text-zinc-500">Matéria não encontrada.</p>
        <button onClick={() => router.push("/admin/articles")} className="mt-3 text-sm font-semibold text-[#E0263B]">
          ← Voltar para Artigos
        </button>
      </div>
    );

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-[#0b0b0c] transition"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          {status && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              {status === "em_analise" ? "Em análise" : status === "publicado" ? "Publicado" : status}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-black text-[#0b0b0c] mb-5">Editar matéria</h1>

        {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 mb-5">{error}</p>}

        <div className="space-y-5">
          {/* Informações */}
          <div className={cardCls}>
            <div className={headCls}>
              <span className={cardLabelCls}>Informações da matéria</span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className={labelCls} htmlFor="titulo">Título</label>
                <input
                  id="titulo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`${inputCls} text-[17px] font-semibold`}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`${labelCls} mb-0`} htmlFor="resumo">Resumo</label>
                  <span className={`text-[11px] ${description.length > 160 ? "text-red-400" : "text-zinc-300"}`}>
                    {description.length}/160
                  </span>
                </div>
                <textarea
                  id="resumo"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={200}
                  className={`${inputCls} resize-none leading-relaxed`}
                />
              </div>
            </div>
          </div>

          {/* Categoria & Capa */}
          <div className={cardCls}>
            <div className={headCls}>
              <span className={cardLabelCls}>Categoria &amp; Capa</span>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls} htmlFor="categoria">Categoria</label>
                <select id="categoria" value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputCls} cursor-pointer`}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Imagem de capa</label>
                <ImageDropZone
                  imageFile={imageFile}
                  imagePreview={imagePreview}
                  onFileChange={handleImageChange}
                  onClear={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                />
              </div>
            </div>
            <label className="flex items-start gap-3 px-5 py-4 border-t border-[#e5e5e5] cursor-pointer">
              <input
                type="checkbox"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[#E0263B]"
              />
              <span>
                <span className="block text-[13px] font-bold text-[#0b0b0c]">Matéria premium (somente assinantes)</span>
                <span className="block text-[12px] text-zinc-500">
                  Visitantes veem só a prévia + convite para assinar; assinantes leem completa e sem anúncios.
                </span>
              </span>
            </label>
          </div>

          {/* Conteúdo */}
          <div className={cardCls}>
            <div className={headCls}>
              <span className={cardLabelCls}>Conteúdo</span>
              <span className="text-[11px] text-zinc-400">Editor com verificação ortográfica</span>
            </div>
            <div className="p-5">{ready && <RichEditor value={content} onChange={setContent} />}</div>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap justify-end gap-3 pb-8">
            <button
              onClick={() => router.back()}
              className="rounded-xl border border-[#e5e5e5] bg-white px-5 py-3 text-sm font-semibold text-zinc-600 hover:border-[#0b0b0c] transition"
            >
              Cancelar
            </button>
            <button
              onClick={() => save(false)}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl border border-[#0b0b0c] bg-white px-6 py-3 text-sm font-bold text-[#0b0b0c] hover:bg-zinc-50 transition disabled:opacity-50"
            >
              {saving && <Loader2 size={14} className="animate-spin" />} Salvar alterações
            </button>
            {status !== "publicado" && (
              <button
                onClick={() => save(true)}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#0b0b0c] px-6 py-3 text-sm font-bold text-white hover:bg-[#E0263B] transition disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Salvar e publicar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
