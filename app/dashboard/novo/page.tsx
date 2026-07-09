"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Lock } from "lucide-react";
import { RichEditor, ImageDropZone } from "@/components/journalist/ArticleEditor";

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

const cardCls = "bg-white border border-[#E8E6E1] rounded-2xl overflow-hidden";
const headCls = "px-5 py-3.5 border-b border-[#E8E6E1] bg-[#fafafa] flex items-center justify-between";
const cardLabelCls = "text-[11px] font-bold uppercase tracking-[0.1em] text-[#0b0b0c]";
const labelCls = "block text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-1.5";
const inputCls =
  "w-full rounded-xl border border-[#E8E6E1] bg-white px-3.5 py-2.5 text-sm text-[#0b0b0c] outline-none focus:border-[#0b0b0c] transition";

export default function NovaPublicacao() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Negócios");
  const [isPremium, setIsPremium] = useState(false);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data: c } = await supabase
        .from("journalist_credits")
        .select("balance")
        .eq("journalist_id", user.id)
        .maybeSingle();
      setCredits(c?.balance ?? 0);
      setLoading(false);
    })();
  }, [router]);

  function handleImageChange(file: File) {
    setImageFile(file);
    const r = new FileReader();
    r.onloadend = () => setImagePreview(r.result as string);
    r.readAsDataURL(file);
  }

  async function uploadCover(): Promise<string | null> {
    if (!imageFile) return null;
    setUploading(true);
    const ext = imageFile.name.split(".").pop();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const path = `brandvoice/${user?.id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("articles").upload(path, imageFile);
    setUploading(false);
    if (upErr) {
      setError("Erro ao enviar imagem: " + upErr.message);
      return null;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("articles").getPublicUrl(path);
    return publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const probe = document.createElement("div");
    probe.innerHTML = content;
    if (!title.trim() || !probe.textContent?.trim()) {
      setError("Preencha ao menos o título e o conteúdo.");
      return;
    }
    setSending(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    const imageUrl = imageFile ? await uploadCover() : null;
    if (imageFile && !imageUrl) {
      setSending(false);
      return;
    }
    const res = await fetch("/api/journalist/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({
        title,
        description,
        content,
        category,
        image_url: imageUrl ?? "",
        is_premium: isPremium,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Erro ao enviar.");
      setSending(false);
      return;
    }
    router.push("/dashboard/publicacoes");
  }

  if (loading) return <div className="p-10 text-sm text-zinc-400">Carregando…</div>;

  if (credits <= 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 md:px-6 py-12">
        <div className="bg-white border border-[#E8E6E1] rounded-2xl p-10 text-center">
          <Lock size={36} className="mx-auto text-zinc-300 mb-4" />
          <h1 className="text-xl font-black text-[#0b0b0c]">Suas publicações do mês acabaram</h1>
          <p className="text-sm text-zinc-500 mt-2">
            Adquira publicações adicionais para enviar uma nova matéria agora, ou aguarde a renovação do seu plano.
          </p>
          <Link
            href="/dashboard/creditos"
            className="inline-block mt-6 bg-[#0b0b0c] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#E0263B] transition"
          >
            Adquirir publicações
          </Link>
        </div>
      </main>
    );
  }

  const busy = sending || uploading;

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-[#0b0b0c]">Nova publicação</h1>
        <span className="text-xs text-zinc-500 bg-white border border-[#E8E6E1] px-3 py-1 rounded-full">
          {credits} publicaç{credits > 1 ? "ões" : "ão"} disponíve{credits > 1 ? "is" : "l"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        {/* Informações da matéria */}
        <div className={cardCls}>
          <div className={headCls}>
            <span className={cardLabelCls}>Informações da matéria</span>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className={labelCls} htmlFor="titulo">Título</label>
              <input
                id="titulo"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título da matéria"
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
                placeholder="Breve descrição da matéria (exibida na listagem)"
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
          <label className="flex items-start gap-3 px-5 py-4 border-t border-[#E8E6E1] cursor-pointer">
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
          <div className="p-5">
            <RichEditor value={content} onChange={setContent} />
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-[12px] text-amber-700">
          Ao enviar, <strong>1 publicação do seu mês</strong> será utilizada e a matéria irá para análise da
          Redação antes de ser publicada.
        </div>

        <div className="flex justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-[#E8E6E1] bg-white px-5 py-3 text-sm font-semibold text-zinc-600 hover:border-[#0b0b0c] transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={busy}
            className="flex items-center gap-2 rounded-xl bg-[#E0263B] px-7 py-3 text-sm font-bold text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            {uploading ? "Enviando imagem…" : sending ? "Enviando…" : "Enviar para análise"}
          </button>
        </div>
      </form>
    </main>
  );
}
