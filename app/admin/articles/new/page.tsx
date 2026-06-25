"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const CATEGORIES = ["Negócios","Tecnologia","IA","Brasil","Política","Mercado","Saúde","Empreende","Startups","Carreira","Revista"];

function generateSlug(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replaceAll(" ","-").replace(/[^\w-]+/g,"");
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

function ToolbarBtn({ label, title, active, onClick }: { label: React.ReactNode; title: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      style={{
        display:"inline-flex", alignItems:"center", justifyContent:"center",
        minWidth:32, height:30, padding:"0 8px", borderRadius:6,
        border: active ? "1.5px solid #E0263B" : "1.5px solid transparent",
        backgroundColor: active ? "#fff0f0" : "transparent",
        color: active ? "#E0263B" : "#333",
        fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.12s",
      }}
    >
      {label}
    </button>
  );
}

function Sep() {
  return <span style={{ display:"inline-block", width:1, height:20, backgroundColor:"#e5e5e5", margin:"0 4px", verticalAlign:"middle" }} />;
}

// ─── Link Modal ───────────────────────────────────────────────────────────────

function LinkModal({ onInsert, onClose }: { onInsert: (url: string, text: string) => void; onClose: () => void }) {
  const [url, setUrl] = useState("https://");
  const [text, setText] = useState("");
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999 }}>
      <div style={{ background:"#fff", borderRadius:16, padding:28, width:420, boxShadow:"0 20px 60px rgba(0,0,0,0.15)", border:"1.5px solid #e5e5e5" }}>
        <h3 style={{ margin:"0 0 18px", fontSize:16, fontWeight:700, color:"#0b0b0c" }}>Inserir link</h3>
        <div style={{ marginBottom:12 }}>
          <label style={labelStyle}>Texto do link</label>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Ex: Leia mais" style={inputStyle} />
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={labelStyle}>URL</label>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." style={inputStyle} />
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button type="button" onClick={onClose} style={{ ...btnBase, background:"#f5f5f5", color:"#555" }}>Cancelar</button>
          <button type="button" onClick={() => { if (url) onInsert(url, text); }} style={{ ...btnBase, background:"#0b0b0c", color:"#fff" }}>Inserir</button>
        </div>
      </div>
    </div>
  );
}

// ─── Color Picker ─────────────────────────────────────────────────────────────

const TEXT_COLORS = ["#000000","#E0263B","#6366F1","#F59E0B","#10B981","#3B82F6","#8B5CF6","#EC4899","#666666","#999999"];
const BG_COLORS   = ["#ffffff","#FFF0F0","#EEF2FF","#FFFBEB","#ECFDF5","#EFF6FF","#F3E8FF","#FCE7F3","#F3F4F6","#F9FAFB"];

function ColorPicker({ onSelect, onClose, type }: { onSelect: (c: string) => void; onClose: () => void; type: "text"|"bg" }) {
  const colors = type === "text" ? TEXT_COLORS : BG_COLORS;
  return (
    <div style={{ position:"absolute", top:36, left:0, zIndex:100, background:"#fff", border:"1.5px solid #e5e5e5", borderRadius:10, padding:10, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", display:"grid", gridTemplateColumns:"repeat(5,28px)", gap:4 }}
      onMouseDown={e => e.preventDefault()}>
      {colors.map(c => (
        <button key={c} type="button" onMouseDown={e => { e.preventDefault(); onSelect(c); onClose(); }}
          style={{ width:28, height:28, borderRadius:6, background:c, border:"1.5px solid #ddd", cursor:"pointer" }} title={c} />
      ))}
    </div>
  );
}

// ─── Rich Editor ──────────────────────────────────────────────────────────────

function RichEditor({ value, onChange, hasError }: { value: string; onChange: (html: string) => void; hasError: boolean }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Set<string>>(new Set());
  const [showLink, setShowLink] = useState(false);
  const [showTextColor, setShowTextColor] = useState(false);
  const [showBgColor, setShowBgColor] = useState(false);
  const savedRange = useRef<Range | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value || "";
  }, []);

  function updateActive() {
    const f = new Set<string>();
    if (document.queryCommandState("bold")) f.add("bold");
    if (document.queryCommandState("italic")) f.add("italic");
    if (document.queryCommandState("underline")) f.add("underline");
    if (document.queryCommandState("strikeThrough")) f.add("strike");
    if (document.queryCommandState("insertUnorderedList")) f.add("ul");
    if (document.queryCommandState("insertOrderedList")) f.add("ol");
    if (document.queryCommandState("justifyLeft")) f.add("left");
    if (document.queryCommandState("justifyCenter")) f.add("center");
    if (document.queryCommandState("justifyRight")) f.add("right");
    const sel = window.getSelection();
    if (sel?.rangeCount) {
      let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
      while (node && node !== editorRef.current) {
        const tag = (node as Element).tagName?.toUpperCase();
        if (tag === "H1") f.add("h1");
        if (tag === "H2") f.add("h2");
        if (tag === "H3") f.add("h3");
        if (tag === "BLOCKQUOTE") f.add("blockquote");
        node = node.parentNode;
      }
    }
    setActive(f);
  }

  function exec(cmd: string, val?: string) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    onChange(editorRef.current?.innerHTML || "");
    updateActive();
  }

  function block(tag: string) {
    editorRef.current?.focus();
    document.execCommand("formatBlock", false, tag);
    onChange(editorRef.current?.innerHTML || "");
    updateActive();
  }

  function saveRange() {
    const sel = window.getSelection();
    if (sel?.rangeCount) savedRange.current = sel.getRangeAt(0).cloneRange();
  }

  function restoreRange() {
    if (!savedRange.current) return;
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(savedRange.current);
  }

  function insertLink(url: string, text: string) {
    restoreRange();
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      document.execCommand("createLink", false, url);
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.textContent = text || url;
      a.target = "_blank";
      a.rel = "noopener";
      const range = savedRange.current;
      if (range) { range.deleteContents(); range.insertNode(a); }
    }
    onChange(editorRef.current?.innerHTML || "");
    setShowLink(false);
  }

  function handleInput() { onChange(editorRef.current?.innerHTML || ""); updateActive(); }

  const [wordCount, setWordCount] = useState(0);
  useEffect(() => {
    const d = document.createElement("div");
    d.innerHTML = value;
    const t = d.textContent?.trim() ?? "";
    setWordCount(t ? t.split(/\s+/).length : 0);
  }, [value]);

  return (
    <>
      {showLink && <LinkModal onInsert={insertLink} onClose={() => setShowLink(false)} />}

      <div style={{ borderRadius:12, border: hasError ? "1.5px solid #f87171" : "1.5px solid #e5e5e5", overflow:"hidden", background:"#fff" }}>

        {/* Toolbar */}
        <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:2, padding:"8px 12px", borderBottom:"1.5px solid #e5e5e5", background:"#fafafa" }}>

          {/* Headings */}
          <ToolbarBtn label="H1" title="Título 1" active={active.has("h1")} onClick={() => block("h1")} />
          <ToolbarBtn label="H2" title="Título 2" active={active.has("h2")} onClick={() => block("h2")} />
          <ToolbarBtn label="H3" title="Subtítulo" active={active.has("h3")} onClick={() => block("h3")} />
          <Sep />

          {/* Inline */}
          <ToolbarBtn label={<strong>N</strong>} title="Negrito (Ctrl+B)" active={active.has("bold")} onClick={() => exec("bold")} />
          <ToolbarBtn label={<em>I</em>} title="Itálico (Ctrl+I)" active={active.has("italic")} onClick={() => exec("italic")} />
          <ToolbarBtn label={<u>S</u>} title="Sublinhado (Ctrl+U)" active={active.has("underline")} onClick={() => exec("underline")} />
          <ToolbarBtn label={<s>R</s>} title="Tachado" active={active.has("strike")} onClick={() => exec("strikeThrough")} />
          <Sep />

          {/* Color text */}
          <div style={{ position:"relative" }}>
            <ToolbarBtn
              label={<span style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:1 }}><span style={{ fontSize:13, fontWeight:700 }}>A</span><span style={{ width:16, height:3, borderRadius:2, background:"#E0263B" }} /></span>}
              title="Cor do texto"
              active={showTextColor}
              onClick={() => { saveRange(); setShowTextColor(v => !v); setShowBgColor(false); }}
            />
            {showTextColor && <ColorPicker type="text" onSelect={c => { restoreRange(); exec("foreColor", c); }} onClose={() => setShowTextColor(false)} />}
          </div>

          {/* Color bg */}
          <div style={{ position:"relative" }}>
            <ToolbarBtn
              label={<span style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:1 }}><span style={{ fontSize:11 }}>🖍</span><span style={{ width:16, height:3, borderRadius:2, background:"#FEF08A" }} /></span>}
              title="Cor de fundo"
              active={showBgColor}
              onClick={() => { saveRange(); setShowBgColor(v => !v); setShowTextColor(false); }}
            />
            {showBgColor && <ColorPicker type="bg" onSelect={c => { restoreRange(); exec("hiliteColor", c); }} onClose={() => setShowBgColor(false)} />}
          </div>

          <Sep />

          {/* Lists */}
          <ToolbarBtn label="• Lista" title="Lista com marcadores" active={active.has("ul")} onClick={() => exec("insertUnorderedList")} />
          <ToolbarBtn label="1. Lista" title="Lista numerada" active={active.has("ol")} onClick={() => exec("insertOrderedList")} />
          <Sep />

          {/* Align */}
          <ToolbarBtn label="≡" title="Alinhar à esquerda" active={active.has("left")} onClick={() => exec("justifyLeft")} />
          <ToolbarBtn label="≡" title="Centralizar" active={active.has("center")} onClick={() => exec("justifyCenter")} />
          <ToolbarBtn label="≡" title="Alinhar à direita" active={active.has("right")} onClick={() => exec("justifyRight")} />
          <Sep />

          {/* Link */}
          <ToolbarBtn
            label={<span style={{ fontSize:12 }}>🔗 Link</span>}
            title="Inserir link"
            active={active.has("link")}
            onClick={() => { saveRange(); setShowLink(true); setShowTextColor(false); setShowBgColor(false); }}
          />
          <ToolbarBtn label="🔗̵" title="Remover link" onClick={() => exec("unlink")} />
          <Sep />

          {/* Block */}
          <ToolbarBtn label="❝" title="Citação" active={active.has("blockquote")} onClick={() => block("blockquote")} />
          <ToolbarBtn label="—" title="Linha divisória" onClick={() => { editorRef.current?.focus(); document.execCommand("insertHorizontalRule"); onChange(editorRef.current?.innerHTML || ""); }} />
          <ToolbarBtn label="¶" title="Parágrafo normal" onClick={() => block("p")} />

          {/* Spacer */}
          <span style={{ flex:1 }} />
          <span style={{ fontSize:11, color:"#bbb", paddingRight:4, whiteSpace:"nowrap" }}>{wordCount} palavras</span>
        </div>

        {/* Editor area */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          spellCheck
          lang="pt-BR"
          onInput={handleInput}
          onKeyUp={updateActive}
          onMouseUp={updateActive}
          data-placeholder="Escreva a matéria completa aqui..."
          style={{ minHeight:520, padding:"18px 20px", fontSize:15, lineHeight:1.8, color:"#0b0b0c", outline:"none", overflowY:"auto" }}
        />
      </div>

      <style>{`
        [contenteditable][data-placeholder]:empty:before { content:attr(data-placeholder); color:#bbb; pointer-events:none; }
        [contenteditable] h1 { font-size:28px; font-weight:700; margin:18px 0 8px; line-height:1.2; color:#0b0b0c; }
        [contenteditable] h2 { font-size:22px; font-weight:700; margin:14px 0 6px; line-height:1.25; color:#0b0b0c; }
        [contenteditable] h3 { font-size:17px; font-weight:600; margin:12px 0 4px; }
        [contenteditable] p  { margin:0 0 12px; }
        [contenteditable] blockquote { border-left:3px solid #E0263B; margin:14px 0; padding:10px 18px; color:#555; font-style:italic; background:#fff8f8; border-radius:0 8px 8px 0; }
        [contenteditable] ul, [contenteditable] ol { padding-left:24px; margin:10px 0; }
        [contenteditable] li { margin-bottom:5px; }
        [contenteditable] a { color:#E0263B; text-decoration:underline; }
        [contenteditable] hr { border:none; border-top:1.5px solid #e5e5e5; margin:18px 0; }
        [contenteditable] strong, [contenteditable] b { font-weight:700; }
      `}</style>
    </>
  );
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────

function ImageDropZone({ imageFile, imagePreview, onFileChange, onClear }: { imageFile: File | null; imagePreview: string | null; onFileChange: (f: File) => void; onClear: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  function handle(file: File) { if (file.type.startsWith("image/")) onFileChange(file); }
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) handle(f); }, []);

  if (imagePreview) {
    return (
      <div style={{ position:"relative", borderRadius:10, overflow:"hidden", height:180, border:"1.5px solid #e5e5e5" }}>
        <img src={imagePreview} alt="Preview" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"8px 12px", background:"linear-gradient(to top,rgba(0,0,0,0.6),transparent)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ color:"#fff", fontSize:11, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"75%" }}>{imageFile?.name}</span>
          <button type="button" onClick={onClear} style={{ background:"rgba(255,255,255,0.9)", border:"none", borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:600, cursor:"pointer", color:"#000" }}>Remover</button>
        </div>
      </div>
    );
  }

  return (
    <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onClick={() => inputRef.current?.click()}
      style={{ height:180, borderRadius:10, border:`2px dashed ${drag ? "#E0263B" : "#d0d0d0"}`, backgroundColor: drag ? "#fff5f5" : "#fafafa", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, cursor:"pointer", transition:"all 0.15s" }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={drag ? "#E0263B" : "#aaa"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
      </svg>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontSize:13, fontWeight:600, color: drag ? "#E0263B" : "#555", margin:0 }}>{drag ? "Solte aqui" : "Arraste ou clique para escolher"}</p>
        <p style={{ fontSize:11, color:"#aaa", margin:"4px 0 0" }}>PNG, JPG, WEBP — recomendado 1200 × 630 px</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handle(f); }} style={{ display:"none" }} />
    </div>
  );
}

// ─── Styles helpers ───────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = { display:"block", fontSize:11, fontWeight:600, color:"#888", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 };
const inputStyle: React.CSSProperties = { width:"100%", padding:"11px 14px", borderRadius:10, border:"1.5px solid #e5e5e5", fontSize:14, outline:"none", boxSizing:"border-box", color:"#0b0b0c", background:"#fff" };
const btnBase: React.CSSProperties = { padding:"10px 20px", borderRadius:10, border:"none", fontSize:13, fontWeight:600, cursor:"pointer" };
const cardStyle: React.CSSProperties = { backgroundColor:"#fff", borderRadius:16, border:"1.5px solid #e5e5e5", overflow:"hidden" };
const cardHeader: React.CSSProperties = { padding:"12px 20px", borderBottom:"1.5px solid #e5e5e5", backgroundColor:"#fafafa", display:"flex", alignItems:"center", justifyContent:"space-between" };
const cardLabel: React.CSSProperties = { color:"#0b0b0c", fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase" };

// ─── Main ─────────────────────────────────────────────────────────────────────

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

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Obrigatório";
    if (!description.trim()) e.description = "Obrigatório";
    if (typeof window !== "undefined") {
      const d = document.createElement("div"); d.innerHTML = content;
      if (!d.textContent?.trim()) e.content = "Obrigatório";
    } else if (!content.trim()) { e.content = "Obrigatório"; }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

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
    const path = `covers/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("articles").upload(path, imageFile);
    if (error) { alert("Erro ao enviar imagem"); setUploading(false); return null; }
    const { data: { publicUrl } } = supabase.storage.from("articles").getPublicUrl(path);
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
    if (!user) { alert("Usuário não autenticado"); setLoading(false); return; }
    const { data: profile } = await supabase.from("journalists").select("name, display_name").eq("id", user.id).maybeSingle();
    const meta = (user.user_metadata ?? {}) as { display_name?: string; name?: string; full_name?: string };
    // nome de jornalismo do cadastro; nunca o e-mail
    const journalistName =
      meta.display_name || profile?.display_name || profile?.name || meta.name || meta.full_name || "Redação Monatiza";
    const { error } = await supabase.from("articles").insert([{
      title, description, content, category,
      image_url: uploadedImage, slug,
      author: journalistName,
      journalist_name: journalistName,
      author_id: user.id,
    }]);
    if (error) { alert(error.message); setLoading(false); return; }
    alert("Matéria publicada com sucesso!");
    router.push("/admin/dashboard");
  }

  const isDisabled = loading || uploading;
  const btnLabel = uploading ? "Enviando imagem…" : loading ? "Publicando…" : "Publicar matéria";

  return (
    <div style={{ backgroundColor:"#F7F6F3", minHeight:"100vh", fontFamily:"sans-serif" }}>

      {/* Top bar */}
      <div style={{ background:"#0b0b0c", borderBottom:"1px solid rgba(255,255,255,0.08)", padding:"14px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ color:"#fff", fontWeight:900, fontSize:16, letterSpacing:"-0.02em" }}>MONATIZA</span>
          <span style={{ width:1, height:16, background:"rgba(255,255,255,0.2)" }} />
          <span style={{ color:"#E0263B", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.3em" }}>Nova Matéria</span>
        </div>
        <button type="button" onClick={() => router.push("/admin/dashboard")}
          style={{ color:"rgba(255,255,255,0.6)", fontSize:13, background:"transparent", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, padding:"6px 16px", cursor:"pointer" }}>
          ← Voltar
        </button>
      </div>

      <form onSubmit={handlePublish}>
        <div style={{ maxWidth:820, margin:"0 auto", padding:"32px 24px", display:"flex", flexDirection:"column", gap:20 }}>

          {/* ── Card: Informações ── */}
          <div style={cardStyle}>
            <div style={cardHeader}>
              <span style={cardLabel}>Informações da matéria</span>
            </div>
            <div style={{ padding:20, display:"flex", flexDirection:"column", gap:16 }}>

              {/* Título */}
              <div>
                <label style={labelStyle}>Título</label>
                <input type="text" placeholder="Digite o título da matéria" value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{ ...inputStyle, fontSize:17, fontWeight:600, border: errors.title ? "1.5px solid #f87171" : "1.5px solid #e5e5e5" }} />
                {errors.title && <p style={{ color:"#f87171", fontSize:11, marginTop:4 }}>{errors.title}</p>}
                {title && <p style={{ fontSize:11, color:"#aaa", marginTop:4 }}>Slug: /{generateSlug(title)}</p>}
              </div>

              {/* Resumo */}
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <label style={{ ...labelStyle, marginBottom:0 }}>Resumo</label>
                  <span style={{ fontSize:11, color: description.length > 160 ? "#f87171" : "#bbb" }}>{description.length}/160</span>
                </div>
                <textarea placeholder="Breve descrição da matéria (exibida na listagem)" value={description}
                  onChange={e => setDescription(e.target.value)} rows={3} maxLength={200}
                  style={{ ...inputStyle, resize:"none", lineHeight:1.6, border: errors.description ? "1.5px solid #f87171" : "1.5px solid #e5e5e5" }} />
                {errors.description && <p style={{ color:"#f87171", fontSize:11, marginTop:4 }}>{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* ── Card: Categoria & Capa ── */}
          <div style={cardStyle}>
            <div style={cardHeader}>
              <span style={cardLabel}>Categoria &amp; Capa</span>
            </div>
            <div style={{ padding:20, display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
              <div>
                <label style={labelStyle}>Categoria</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  style={{ ...inputStyle, cursor:"pointer" }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Imagem de capa</label>
                <ImageDropZone imageFile={imageFile} imagePreview={imagePreview} onFileChange={handleImageChange} onClear={() => { setImageFile(null); setImagePreview(null); }} />
              </div>
            </div>
          </div>

          {/* ── Card: Conteúdo ── */}
          <div style={cardStyle}>
            <div style={cardHeader}>
              <span style={cardLabel}>Conteúdo</span>
              <span style={{ fontSize:11, color:"#bbb" }}>Editor com verificação ortográfica</span>
            </div>
            <div style={{ padding:20 }}>
              <RichEditor value={content} onChange={setContent} hasError={!!errors.content} />
              {errors.content && <p style={{ color:"#f87171", fontSize:11, marginTop:6 }}>{errors.content}</p>}
            </div>
          </div>

          {/* ── Ações ── */}
          <div style={{ display:"flex", justifyContent:"flex-end", gap:12, paddingBottom:32 }}>
            <button type="button" onClick={() => router.push("/admin/dashboard")}
              style={{ ...btnBase, background:"#fff", color:"#555", border:"1.5px solid #e5e5e5" }}>
              Cancelar
            </button>
            <button type="submit" disabled={isDisabled}
              style={{ ...btnBase, background: isDisabled ? "#ccc" : "#E0263B", color:"#fff", border:"none", display:"flex", alignItems:"center", gap:8, padding:"10px 28px", cursor: isDisabled ? "not-allowed" : "pointer", transition:"opacity 0.2s" }}>
              {isDisabled && (
                <span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} />
              )}
              {btnLabel}
            </button>
          </div>

        </div>
      </form>

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}