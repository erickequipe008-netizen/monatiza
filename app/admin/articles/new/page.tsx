"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useCallback, useEffect } from "react";
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

// ─── Rich Text Toolbar ──────────────────────────────────────────────────────

type ToolbarButtonProps = {
  label: string;
  title: string;
  active?: boolean;
  onClick: () => void;
};

function ToolbarButton({ label, title, active, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault(); // prevents editor from losing focus
        onClick();
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 32,
        height: 30,
        padding: "0 8px",
        borderRadius: 6,
        border: active ? "1.5px solid #000" : "1.5px solid transparent",
        backgroundColor: active ? "#f0f0f0" : "transparent",
        color: "#000",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function Divider() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 1,
        height: 20,
        backgroundColor: "#e0e0e0",
        margin: "0 4px",
        verticalAlign: "middle",
      }}
    />
  );
}

// ─── Editor Component ────────────────────────────────────────────────────────

function RichTextEditor({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (html: string) => void;
  hasError: boolean;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // Initialize content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, []); // only on mount

  function updateActiveFormats() {
    const formats = new Set<string>();
    if (document.queryCommandState("bold")) formats.add("bold");
    if (document.queryCommandState("italic")) formats.add("italic");
    if (document.queryCommandState("underline")) formats.add("underline");
    if (document.queryCommandState("insertUnorderedList")) formats.add("ul");
    if (document.queryCommandState("insertOrderedList")) formats.add("ol");

    // Check heading
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
      while (node && node !== editorRef.current) {
        const tag = (node as Element).tagName?.toUpperCase();
        if (tag === "H1") formats.add("h1");
        if (tag === "H2") formats.add("h2");
        if (tag === "H3") formats.add("h3");
        if (tag === "BLOCKQUOTE") formats.add("blockquote");
        node = node.parentNode;
      }
    }
    setActiveFormats(formats);
  }

  function exec(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    onChange(editorRef.current?.innerHTML || "");
    updateActiveFormats();
  }

  function execBlock(tag: string) {
    editorRef.current?.focus();
    document.execCommand("formatBlock", false, tag);
    onChange(editorRef.current?.innerHTML || "");
    updateActiveFormats();
  }

  function handleInput() {
    onChange(editorRef.current?.innerHTML || "");
    updateActiveFormats();
  }

  function handleKeyUp() {
    updateActiveFormats();
  }

  function handleMouseUp() {
    updateActiveFormats();
  }

  return (
    <div
      style={{
        borderRadius: 10,
        border: hasError ? "1.5px solid #f87171" : "1.5px solid #e5e5e5",
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
          padding: "8px 10px",
          borderBottom: "1.5px solid #e5e5e5",
          backgroundColor: "#fafafa",
        }}
      >
        {/* Headings */}
        <ToolbarButton label="H1" title="Título 1" active={activeFormats.has("h1")} onClick={() => execBlock("h1")} />
        <ToolbarButton label="H2" title="Título 2" active={activeFormats.has("h2")} onClick={() => execBlock("h2")} />
        <ToolbarButton label="H3" title="Título 3" active={activeFormats.has("h3")} onClick={() => execBlock("h3")} />

        <Divider />

        {/* Inline formatting */}
        <ToolbarButton label="N" title="Negrito (Ctrl+B)" active={activeFormats.has("bold")} onClick={() => exec("bold")} />
        <ToolbarButton label="I" title="Itálico (Ctrl+I)" active={activeFormats.has("italic")} onClick={() => exec("italic")} />
        <ToolbarButton label="S" title="Sublinhado (Ctrl+U)" active={activeFormats.has("underline")} onClick={() => exec("underline")} />

        <Divider />

        {/* Lists */}
        <ToolbarButton label="• Lista" title="Lista com marcadores" active={activeFormats.has("ul")} onClick={() => exec("insertUnorderedList")} />
        <ToolbarButton label="1. Lista" title="Lista numerada" active={activeFormats.has("ol")} onClick={() => exec("insertOrderedList")} />

        <Divider />

        {/* Block */}
        <ToolbarButton label="❝ Citação" title="Citação em bloco" active={activeFormats.has("blockquote")} onClick={() => execBlock("blockquote")} />
        <ToolbarButton label="¶ Normal" title="Parágrafo normal" onClick={() => execBlock("p")} />
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={handleKeyUp}
        onMouseUp={handleMouseUp}
        data-placeholder="Escreva a matéria completa aqui..."
        style={{
          minHeight: 520,
          padding: "16px 18px",
          fontSize: 15,
          lineHeight: 1.75,
          color: "#000",
          outline: "none",
          overflowY: "auto",
        }}
      />

      {/* Editor styles injected inline via a style tag trick using dangerouslySetInnerHTML on a sibling isn't ideal,
          so we use a <style> jsx tag pattern below – add to your global CSS instead in production */}
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #bbb;
          pointer-events: none;
        }
        [contenteditable] h1 { font-size: 28px; font-weight: 700; margin: 16px 0 8px; line-height: 1.25; }
        [contenteditable] h2 { font-size: 22px; font-weight: 700; margin: 14px 0 6px; line-height: 1.3; }
        [contenteditable] h3 { font-size: 18px; font-weight: 600; margin: 12px 0 4px; line-height: 1.35; }
        [contenteditable] p  { margin: 0 0 10px; }
        [contenteditable] blockquote {
          border-left: 3px solid #000;
          margin: 12px 0;
          padding: 8px 16px;
          color: #555;
          font-style: italic;
          background: #fafafa;
        }
        [contenteditable] ul, [contenteditable] ol { padding-left: 24px; margin: 8px 0; }
        [contenteditable] li { margin-bottom: 4px; }
        [contenteditable] strong, [contenteditable] b { font-weight: 700; }
      `}</style>
    </div>
  );
}

// ─── Image Drop Zone ─────────────────────────────────────────────────────────

function ImageDropZone({
  imageFile,
  imagePreview,
  onFileChange,
  onClear,
}: {
  imageFile: File | null;
  imagePreview: string | null;
  onFileChange: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    onFileChange(file);
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [onFileChange]
  );

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  if (imagePreview) {
    return (
      <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", height: 180, border: "1.5px solid #e5e5e5" }}>
        <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "8px 12px",
            background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: "#fff", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>
            {imageFile?.name}
          </span>
          <button
            type="button"
            onClick={onClear}
            style={{
              background: "rgba(255,255,255,0.9)",
              border: "none",
              borderRadius: 6,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
              color: "#000",
            }}
          >
            Remover
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      style={{
        height: 180,
        borderRadius: 10,
        border: `2px dashed ${isDragging ? "#000" : "#d0d0d0"}`,
        backgroundColor: isDragging ? "#f5f5f5" : "#fafafa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={isDragging ? "#000" : "#aaa"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: isDragging ? "#000" : "#555", margin: 0 }}>
          {isDragging ? "Solte a imagem aqui" : "Arraste uma imagem ou clique para escolher"}
        </p>
        <p style={{ fontSize: 11, color: "#aaa", margin: "4px 0 0" }}>PNG, JPG, WEBP — recomendado 1200 × 630 px</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleInputChange} style={{ display: "none" }} />
    </div>
  );
}

// ─── Character counter ───────────────────────────────────────────────────────

function charCount(html: string) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent?.length ?? 0;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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
    // Strip HTML to check if content is truly empty
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    if (!tempDiv.textContent?.trim()) newErrors.content = "Obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleImageChange(file: File) {
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
  .from("journalists")
  .select("name")
  .eq("id", user.id)
  .single();

console.log(profile);

    const { error } = await supabase.from("articles").insert([{
      title,
      description,
      content,
      category,
      image_url: uploadedImage,
      slug,
      author: profile?.name || user.email,
journalist_name: profile?.name || user.email,
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
  const buttonLabel = uploading
    ? "Enviando imagem…"
    : loading
    ? "Publicando…"
    : "Publicar matéria";

  // Live word count from HTML content
  const wordCount =
    typeof window !== "undefined"
      ? (() => {
          const temp = document.createElement("div");
          temp.innerHTML = content;
          const text = temp.textContent?.trim() ?? "";
          return text ? text.split(/\s+/).length : 0;
        })()
      : 0;

  return (
    <main style={{ backgroundColor: "#f4f4f4", minHeight: "100vh" }} className="px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p
              style={{ color: "#888", fontSize: 11, letterSpacing: "0.12em" }}
              className="uppercase font-medium mb-1"
            >
              Monatiza · Painel Editorial
            </p>
            <h1 style={{ color: "#000", fontSize: 26, fontWeight: 700 }}>Nova matéria</h1>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            style={{
              color: "#000",
              border: "1.5px solid #ddd",
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: "8px 18px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            ← Voltar
          </button>
        </div>

        <form onSubmit={handlePublish} className="space-y-4">

          {/* ── Card: Informações principais ── */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              border: "1.5px solid #e5e5e5",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1.5px solid #e5e5e5",
                backgroundColor: "#fafafa",
              }}
            >
              <span
                style={{
                  color: "#000",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Informações da matéria
              </span>
            </div>
            <div
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >

              {/* Título */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#888",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 6,
                  }}
                >
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
                    border: errors.title
                      ? "1.5px solid #f87171"
                      : "1.5px solid #e5e5e5",
                    fontSize: 16,
                    fontWeight: 500,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.title && (
                  <p style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Resumo */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#888",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Resumo
                  </label>
                  <span style={{ fontSize: 11, color: description.length > 160 ? "#f87171" : "#bbb" }}>
                    {description.length}/160
                  </span>
                </div>
                <textarea
                  placeholder="Breve descrição da matéria (exibida na listagem)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={200}
                  style={{
                    ...field,
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: errors.description
                      ? "1.5px solid #f87171"
                      : "1.5px solid #e5e5e5",
                    fontSize: 14,
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                    lineHeight: 1.6,
                  }}
                />
                {errors.description && (
                  <p style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Card: Categoria & Capa ── */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              border: "1.5px solid #e5e5e5",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1.5px solid #e5e5e5",
                backgroundColor: "#fafafa",
              }}
            >
              <span
                style={{
                  color: "#000",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Categoria &amp; Capa
              </span>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Categoria */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#888",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 6,
                  }}
                >
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
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Drop zone de imagem */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#888",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 6,
                  }}
                >
                  Imagem de capa
                </label>
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
          </div>

          {/* ── Card: Conteúdo ── */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              border: "1.5px solid #e5e5e5",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1.5px solid #e5e5e5",
                backgroundColor: "#fafafa",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  color: "#000",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Conteúdo
              </span>
              <span style={{ fontSize: 11, color: "#bbb" }}>
                {wordCount} {wordCount === 1 ? "palavra" : "palavras"}
              </span>
            </div>
            <div style={{ padding: "20px" }}>
              <RichTextEditor
                value={content}
                onChange={setContent}
                hasError={!!errors.content}
              />
              {errors.content && (
                <p style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>
                  {errors.content}
                </p>
              )}
            </div>
          </div>

          {/* ── Ações ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard")}
              style={{
                color: "#555",
                border: "1.5px solid #ddd",
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: "13px 22px",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
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
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {isDisabled && (
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
              )}
              {buttonLabel}
            </button>
          </div>

        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}