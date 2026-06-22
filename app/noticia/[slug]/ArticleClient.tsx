"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Clock3, ArrowLeft, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

function timeAgo(dateStr?: string) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Agora mesmo";
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d atrás`;
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function ArticleClient() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .single();

      if (data) {
        setArticle(data);
        // busca artigos relacionados pela mesma categoria
        const { data: rel } = await supabase
          .from("articles")
          .select("id, title, slug, category, image_url, created_at, excerpt")
          .eq("category", data.category)
          .neq("slug", slug)
          .order("created_at", { ascending: false })
          .limit(4);
        if (rel) setRelated(rel);
      }
      setLoading(false);
    }
    if (slug) load();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-[760px] mx-auto px-4 py-16 space-y-6 animate-pulse">
        <div className="h-3 w-24 bg-zinc-200 rounded" />
        <div className="h-10 w-full bg-zinc-200 rounded" />
        <div className="h-10 w-3/4 bg-zinc-200 rounded" />
        <div className="h-4 w-32 bg-zinc-200 rounded" />
        <div className="w-full h-[400px] bg-zinc-200 rounded" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 w-full bg-zinc-200 rounded" />
        ))}
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-[760px] mx-auto px-4 py-24 text-center">
        <p className="text-zinc-500 text-[15px] mb-4">Artigo não encontrado.</p>
        <Link href="/" className="text-red-600 font-semibold hover:underline text-[14px]">
          ← Voltar para a home
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: article.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Quebra o body em parágrafos pelo \n ou detecta HTML
  const bodyContent = article.body || article.content || "";
  const isHtml = /<[a-z][\s\S]*>/i.test(bodyContent);

  return (
    <div className="bg-white text-black min-h-screen">

      {/* ── BREADCRUMB / VOLTAR ── */}
      <div className="border-b border-zinc-100">
        <div className="max-w-[1180px] mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-red-600 transition-colors font-medium"
          >
            <ArrowLeft size={13} />
            Home
          </Link>
          <span className="text-zinc-300 text-[12px]">/</span>
          {article.category && (
            <>
              <span className="text-[12px] text-red-600 font-bold uppercase tracking-wider">
                {article.category}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── LAYOUT PRINCIPAL ── */}
      <div className="max-w-[1180px] mx-auto px-4 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 lg:gap-16 items-start">

        {/* ── COLUNA ARTIGO ── */}
        <article>

          {/* Categoria */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-red-600 text-[11px] font-black uppercase tracking-widest">
              {article.category}
            </span>
          </div>

          {/* Título */}
          <h1 className="text-[28px] sm:text-[36px] md:text-[44px] leading-[1.08] font-serif font-black tracking-tight text-zinc-950 mb-5">
            {article.title}
          </h1>

          {/* Subtítulo / Excerpt */}
          {article.excerpt && (
            <p className="text-[17px] md:text-[18px] leading-[1.6] text-zinc-500 font-normal mb-6 border-l-2 border-red-600 pl-4">
              {article.excerpt}
            </p>
          )}

          {/* Meta: autor + data + compartilhar */}
          <div className="flex items-center justify-between gap-4 py-4 border-t border-b border-zinc-100 mb-7">
            <div className="flex items-center gap-3">
              {article.author_avatar ? (
                <img
                  src={article.author_avatar}
                  alt={article.author}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                  {(article.author || "M").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-[13px] font-semibold text-zinc-800 leading-tight">
                  {article.author || "Redação Monatiza"}
                </p>
                <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                  <Clock3 size={10} />
                  {timeAgo(article.created_at)}
                </p>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-red-600 transition-colors font-medium"
            >
              <Share2 size={14} />
              Compartilhar
            </button>
          </div>

          {/* Imagem principal */}
          {article.image_url && (
            <div className="w-full overflow-hidden mb-8" style={{ aspectRatio: "16/9" }}>
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              {article.image_caption && (
                <p className="text-[11px] text-zinc-400 mt-2 text-center italic">
                  {article.image_caption}
                </p>
              )}
            </div>
          )}

          {/* Corpo do artigo */}
          <div className="article-body">
            {isHtml ? (
              <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
            ) : (
              bodyContent.split(/\n\n+/).filter(Boolean).map((para: string, i: number) => (
                <p key={i}>{para.trim()}</p>
              ))
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-zinc-100 flex flex-wrap gap-2">
              {(Array.isArray(article.tags) ? article.tags : article.tags.split(",")).map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider bg-zinc-100 text-zinc-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Compartilhar rodapé */}
          <div className="mt-10 pt-6 border-t border-zinc-100 flex items-center gap-3 flex-wrap">
            <span className="text-[12px] font-bold uppercase tracking-wider text-zinc-400 mr-1">Compartilhar</span>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(article.title + " " + (typeof window !== "undefined" ? window.location.href : ""))}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Compartilhar no WhatsApp"
              className="flex items-center gap-2 px-4 py-2 border border-zinc-200 text-zinc-600 hover:border-[#25D366] hover:text-[#25D366] transition-all group"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-[12px] font-semibold">WhatsApp</span>
            </a>

            {/* X (Twitter) */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Compartilhar no X"
              className="flex items-center gap-2 px-4 py-2 border border-zinc-200 text-zinc-600 hover:border-black hover:text-black transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.746-8.855L1.5 2.25h6.817l4.265 5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="text-[12px] font-semibold">X</span>
            </a>

            {/* LinkedIn */}
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Compartilhar no LinkedIn"
              className="flex items-center gap-2 px-4 py-2 border border-zinc-200 text-zinc-600 hover:border-[#0A66C2] hover:text-[#0A66C2] transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-[12px] font-semibold">LinkedIn</span>
            </a>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Compartilhar no Facebook"
              className="flex items-center gap-2 px-4 py-2 border border-zinc-200 text-zinc-600 hover:border-[#1877F2] hover:text-[#1877F2] transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-[12px] font-semibold">Facebook</span>
            </a>
          </div>
        </article>

        {/* ── SIDEBAR: Leia também ── */}
        <aside className="lg:sticky lg:top-[56px]">
          <div className="border-b-2 border-red-600 mb-5 pb-2">
            <span className="text-[12px] font-black uppercase tracking-widest text-zinc-800">Leia também</span>
          </div>
          <div className="flex flex-col divide-y divide-zinc-100">
            {related.length > 0 ? related.map((item) => (
              <Link
                href={`/noticia/${item.slug}`}
                key={item.id}
                className="group py-5 first:pt-0 flex flex-col gap-2"
              >
                {item.image_url && (
                  <div className="w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <span className="text-red-600 text-[10px] font-black uppercase tracking-widest mt-1">
                  {item.category}
                </span>
                <h3 className="text-[14px] leading-[1.35] font-bold text-zinc-900 group-hover:text-red-600 transition-colors">
                  {item.title}
                </h3>
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Clock3 size={10} /> {timeAgo(item.created_at)}
                </span>
              </Link>
            )) : (
              <p className="text-[13px] text-zinc-400 py-4">Nenhum artigo relacionado.</p>
            )}
          </div>
        </aside>
      </div>

      {/* ── ESTILOS DO CORPO DO ARTIGO ── */}
      <style>{`
        .article-body {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 18px;
          line-height: 1.85;
          color: #1a1a1a;
        }
        .article-body p {
          margin-bottom: 1.5em;
        }
        .article-body h2 {
          font-size: 26px;
          font-weight: 800;
          line-height: 1.2;
          color: #0a0a0a;
          margin: 2em 0 0.75em;
          font-family: Georgia, serif;
        }
        .article-body h3 {
          font-size: 20px;
          font-weight: 700;
          line-height: 1.3;
          color: #111;
          margin: 1.75em 0 0.6em;
          font-family: Georgia, serif;
        }
        .article-body blockquote {
          border-left: 3px solid #dc2626;
          padding-left: 1.25rem;
          margin: 2em 0;
          color: #444;
          font-style: italic;
          font-size: 19px;
        }
        .article-body a {
          color: #dc2626;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .article-body strong {
          font-weight: 700;
          color: #0a0a0a;
        }
        .article-body ul, .article-body ol {
          padding-left: 1.5rem;
          margin-bottom: 1.5em;
        }
        .article-body li {
          margin-bottom: 0.5em;
        }
        .article-body img {
          width: 100%;
          height: auto;
          margin: 2em 0;
        }
        .article-body figure {
          margin: 2em 0;
        }
        .article-body figcaption {
          font-size: 13px;
          color: #888;
          text-align: center;
          margin-top: 0.5em;
          font-family: system-ui, sans-serif;
        }
        .article-body hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 2.5em 0;
        }
      `}</style>
    </div>
  );
}