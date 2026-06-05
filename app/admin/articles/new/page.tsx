"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const CATEGORIES = [
  "Negócios",
  "Tecnologia",
  "IA",
  "Brasil",
  "Política",
  "Mercado",
  "Saúde",
];

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll(" ", "-")
    .replace(/[^\w-]+/g, "");
}

const field: React.CSSProperties = {
  color: "#000",
  backgroundColor: "#fff",
  caretColor: "#000",
};

export default function NewArticlePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Negócios");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Obrigatório";
    if (!description.trim()) newErrors.description = "Obrigatório";
    if (!content.trim()) newErrors.content = "Obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function uploadCover(): Promise<string | null> {
    if (!imageFile) return null;
    setUploading(true);
    const fileExt = imageFile.name.split(".").pop();
    const filePath = `covers/${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from("articles").upload(filePath, imageFile);
    if (error) {
      alert("Erro ao enviar imagem");
      setUploading(false);
      return null;
    }
    const { data: { publicUrl } } = supabase.storage.from("articles").getPublicUrl(filePath);
    setUploading(false);
    return publicUrl;
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const uploadedImage = await uploadCover();
    const slug = generateSlug(title);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Usuário não autenticado");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    const { error } = await supabase.from("articles").insert([{
      title,
      description,
      content,
      category,
      image_url: uploadedImage,
      slug,
      author: profile?.display_name || user.email,
      journalist_name: profile?.display_name || user.email,
      author_id: user.id,
    }]);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    alert("Matéria publicada com sucesso!");
    router.push("/admin/dashboard");
  }

  const isDisabled = loading || uploading;
  const buttonLabel = uploading ? "Enviando..." : loading ? "Publicando..." : "Publicar matéria";

  return (
    <main style={{ backgroundColor: "#f4f4f4", minHeight: "100vh" }} className="px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p style={{ color: "#888", fontSize: 11, letterSpacing: "0.12em" }} className="uppercase font-medium mb-1">
              Monatiza · Painel Editorial
            </p>
            <h1 style={{ color: "#000", fontSize: 26, fontWeight: 700 }}>
              Nova matéria
            </h1>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            style={{ color: "#000", border: "1.5px solid #ddd", backgroundColor: "#fff", borderRadius: 10, padding: "8px 18px", fontSize: 13, cursor: "pointer" }}
          >
            ← Voltar
          </button>
        </div>

        <form onSubmit={handlePublish} className="space-y-4">

          {/* Card: Informações principais */}
          <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1.5px solid #e5e5e5", overflow: "hidden" }}>
            <div style={{ padding: "12px 20px", borderBottom: "1.5px solid #e5e5e5", backgroundColor: "#fafafa" }}>
              <span style={{ color: "#000", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Informações da matéria
              </span>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Título */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  Título
                </label>
                <input
                  type="text"
                  placeholder="Digite o título da matéria"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    ...field,
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: errors.title ? "1.5px solid #f87171" : "1.5px solid #e5e5e5",
                    fontSize: 16,
                    fontWeight: 500,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.title && <p style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>{errors.title}</p>}
              </div>

              {/* Resumo */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  Resumo
                </label>
                <textarea
                  placeholder="Breve descrição da matéria"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{
                    ...field,
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: errors.description ? "1.5px solid #f87171" : "1.5px solid #e5e5e5",
                    fontSize: 14,
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                    lineHeight: 1.6,
                  }}
                />
                {errors.description && <p style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>{errors.description}</p>}
              </div>

            </div>
          </div>

          {/* Card: Metadados */}
          <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1.5px solid #e5e5e5", overflow: "hidden" }}>
            <div style={{ padding: "12px 20px", borderBottom: "1.5px solid #e5e5e5", backgroundColor: "#fafafa" }}>
              <span style={{ color: "#000", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Categoria &amp; Capa
              </span>
            </div>
            <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

              {/* Categoria */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    ...field,
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e5e5e5",
                    fontSize: 14,
                    outline: "none",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Capa */}
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  Imagem de capa
                </label>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1.5px solid #e5e5e5",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}>
                  <span style={{ fontSize: 13, color: imageFile ? "#000" : "#aaa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {imageFile ? imageFile.name : "Escolher arquivo..."}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                </label>
              </div>

            </div>

            {/* Preview */}
            {imagePreview && (
              <div style={{ padding: "0 20px 20px" }}>
                <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", height: 180, border: "1.5px solid #e5e5e5" }}>
                  <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    style={{ position: "absolute", top: 10, right: 10, width: 28, height: 28, borderRadius: "50%", backgroundColor: "#fff", border: "1px solid #e5e5e5", cursor: "pointer", fontSize: 12, color: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card: Conteúdo */}
          <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1.5px solid #e5e5e5", overflow: "hidden" }}>
            <div style={{ padding: "12px 20px", borderBottom: "1.5px solid #e5e5e5", backgroundColor: "#fafafa" }}>
              <span style={{ color: "#000", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Conteúdo
              </span>
            </div>
            <div style={{ padding: "20px" }}>
              <textarea
                placeholder="Escreva a matéria completa aqui..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  ...field,
                  width: "100%",
                  height: 520,
                  padding: "14px",
                  borderRadius: 10,
                  border: errors.content ? "1.5px solid #f87171" : "1.5px solid #e5e5e5",
                  fontSize: 15,
                  outline: "none",
                  resize: "none",
                  boxSizing: "border-box",
                  lineHeight: 1.7,
                }}
              />
              {errors.content && <p style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>{errors.content}</p>}
            </div>
          </div>

          {/* Ações */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={isDisabled}
              style={{
                backgroundColor: isDisabled ? "#ccc" : "#000",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "13px 28px",
                fontSize: 14,
                fontWeight: 600,
                cursor: isDisabled ? "not-allowed" : "pointer",
                transition: "opacity 0.2s",
              }}
            >
              {buttonLabel}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}