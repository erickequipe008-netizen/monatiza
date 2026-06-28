"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Loader2, ImageIcon, Lock } from "lucide-react";

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

export default function NovaPublicacao() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Negócios");
  const [isPremium, setIsPremium] = useState(false);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
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

  async function uploadCover(file: File) {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const path = `brandvoice/${user?.id}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("articles").upload(path, file);
    if (upErr) {
      setError("Erro ao enviar imagem: " + upErr.message);
      setUploading(false);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("articles").getPublicUrl(path);
    setImageUrl(publicUrl);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim() || !content.trim()) {
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
    const res = await fetch("/api/journalist/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ title, description, content, category, image_url: imageUrl, is_premium: isPremium }),
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
          <h1 className="text-xl font-black text-[#0b0b0c]">Sem créditos disponíveis</h1>
          <p className="text-sm text-zinc-500 mt-2">
            Você não possui créditos disponíveis. Adquira um novo crédito para publicar um artigo.
          </p>
          <Link
            href="/dashboard/creditos"
            className="inline-block mt-6 bg-[#0b0b0c] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#E0263B] transition"
          >
            Comprar créditos
          </Link>
        </div>
      </main>
    );
  }

  const inputCls =
    "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black outline-none placeholder:text-gray-300 focus:border-gray-400 transition";

  return (
    <main className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-[#0b0b0c]">Nova publicação</h1>
        <span className="text-xs text-zinc-500 bg-white border border-[#E8E6E1] px-3 py-1 rounded-full">
          {credits} crédito{credits > 1 ? "s" : ""}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Título</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da publicação" className={inputCls} />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Subtítulo / resumo</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrição (aparece na listagem)" className={inputCls} />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Categoria</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isPremium}
            onChange={(e) => setIsPremium(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#E0263B]"
          />
          <span>
            <span className="block text-[13px] font-bold text-[#0b0b0c]">Matéria premium (somente assinantes)</span>
            <span className="block text-[12px] text-gray-500">
              Visitantes veem só a prévia + convite para assinar; assinantes leem completa e sem anúncios.
            </span>
          </span>
        </label>

        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Imagem de destaque</label>
          <div className="flex items-center gap-4">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="capa" className="w-28 h-16 rounded-lg object-cover" />
            ) : (
              <div className="w-28 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                <ImageIcon size={18} className="text-gray-300" />
              </div>
            )}
            <label className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold text-black hover:border-gray-400 transition cursor-pointer">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
              {uploading ? "Enviando…" : "Enviar imagem"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadCover(f);
                }}
              />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Conteúdo</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder="Escreva o conteúdo da matéria. Separe os parágrafos com uma linha em branco."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black outline-none resize-y placeholder:text-gray-300 focus:border-gray-400 transition"
          />
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-[12px] text-amber-700">
          Ao enviar, <strong>1 crédito</strong> será consumido e a matéria irá para análise da redação antes de ser publicada.
        </div>

        <button
          type="submit"
          disabled={sending || uploading}
          className="flex items-center gap-2 bg-[#0b0b0c] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#E0263B] transition disabled:opacity-50"
        >
          {sending && <Loader2 size={14} className="animate-spin" />}
          {sending ? "Enviando…" : "Enviar para análise"}
        </button>
      </form>
    </main>
  );
}
