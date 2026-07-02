"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bookmark, Heart, Share2, Clock3, Loader2, Crown } from "lucide-react";
import { fetchArticleBySlug, fetchArticleBody, fetchLatest, type ArticleCard } from "@/lib/premium/articles";
import {
  isBookmarked,
  toggleBookmark,
  isLiked,
  toggleLike,
  recordView,
  addReadingTime,
} from "@/lib/premium/library";
import { timeAgo } from "@/components/premium/PremiumCards";

export default function Reader() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [article, setArticle] = useState<ArticleCard | null>(null);
  const [body, setBody] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [progress, setProgress] = useState(0);

  // Recomendações no fim da matéria (rolagem infinita: conteúdo após conteúdo).
  const [recs, setRecs] = useState<ArticleCard[]>([]);
  const [recsDone, setRecsDone] = useState(false);
  const recsBusy = useRef(false);
  const recsCursor = useRef<string | null>(null);
  const recsSeen = useRef<Set<number>>(new Set());
  const recsSentinel = useRef<HTMLDivElement | null>(null);

  const startRef = useRef<number>(Date.now());
  const progressRef = useRef<number>(0);

  // Carrega matéria + corpo (assinante destrava premium via RPC) + estado salvo/curtido.
  useEffect(() => {
    if (!slug) return;
    let active = true;
    (async () => {
      setLoading(true);
      const a = await fetchArticleBySlug(slug);
      if (!active) return;
      setArticle(a);
      if (a) {
        const [b, sv, lk] = await Promise.all([
          fetchArticleBody(slug),
          isBookmarked(a.id),
          isLiked(a.id),
        ]);
        if (!active) return;
        setBody(b);
        setSaved(sv);
        setLiked(lk);
        recordView(a.id);
        startRef.current = Date.now();
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  // Progresso de leitura pela rolagem.
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? Math.min(1, h.scrollTop / max) : 0;
      progressRef.current = p;
      setProgress(Math.round(p * 100));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ao sair, acumula o tempo de leitura.
  useEffect(() => {
    return () => {
      if (article) {
        const secs = (Date.now() - startRef.current) / 1000;
        if (secs > 2) addReadingTime(article.id, secs, progressRef.current);
      }
    };
  }, [article]);

  // Carrega mais recomendações (cursor por data) evitando repetir a própria matéria.
  const loadRecs = useCallback(async () => {
    if (recsBusy.current || recsDone || !article) return;
    recsBusy.current = true;
    const batch = await fetchLatest(8, recsCursor.current);
    const fresh = batch.filter((a) => a.id !== article.id && !recsSeen.current.has(a.id));
    fresh.forEach((a) => recsSeen.current.add(a.id));
    if (batch.length > 0) recsCursor.current = batch[batch.length - 1].created_at ?? null;
    if (batch.length < 8) setRecsDone(true);
    if (fresh.length) setRecs((prev) => [...prev, ...fresh]);
    recsBusy.current = false;
  }, [article, recsDone]);

  // Reinicia a lista ao trocar de matéria (ao clicar numa recomendação, avança do topo).
  useEffect(() => {
    if (!article) return;
    recsSeen.current = new Set([article.id]);
    recsCursor.current = null;
    recsBusy.current = false;
    setRecs([]);
    setRecsDone(false);
    window.scrollTo({ top: 0 });
  }, [article?.id]);

  // Observa o fim da página e vai puxando mais conteúdo automaticamente.
  useEffect(() => {
    const el = recsSentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && loadRecs(), { rootMargin: "1000px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadRecs, recsDone]);

  async function onSave() {
    if (!article) return;
    const next = !saved;
    setSaved(next);
    await toggleBookmark(article.id, next);
  }
  async function onLike() {
    if (!article) return;
    const next = !liked;
    setLiked(next);
    await toggleLike(article.id, next);
  }
  function onShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: article?.title, url: window.location.href });
    } else if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-zinc-400">
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-serif text-2xl font-black">Matéria não encontrada</h1>
        <Link href="/app" className="mt-4 inline-block text-sm font-bold text-[#E0263B]">
          Voltar para o início
        </Link>
      </div>
    );
  }

  const isHtml = /<[a-z][\s\S]*>/i.test(body || "");
  const author =
    article.journalist_name && !String(article.journalist_name).includes("@")
      ? article.journalist_name
      : "Redação Monatiza";
  const wordCount = (body || "").replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const readMin = Math.max(1, Math.round(wordCount / 200));

  return (
    <article className="mx-auto max-w-[720px]">
      {/* barra de progresso de leitura */}
      <div className="fixed inset-x-0 top-0 z-50 h-[3px]">
        <div
          className="pro-gradient h-full transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Link
        href="/app"
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-zinc-500 hover:text-[#E0263B]"
      >
        <ArrowLeft size={14} /> Início
      </Link>

      <div className="mb-3 flex items-center gap-3">
        <span className="pro-gradient-text text-[11px] font-black uppercase tracking-widest">
          {article.category}
        </span>
        {article.is_premium && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#0b0b0c] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
            <Crown size={11} className="text-[#E0263B]" /> Exclusivo
          </span>
        )}
      </div>

      <h1 className="font-serif text-[30px] md:text-[42px] font-black leading-[1.1] tracking-tight">
        {article.title}
      </h1>

      {article.excerpt && (
        <p className="mt-4 border-l-2 border-[#9B72CB] pl-4 text-[18px] leading-relaxed text-zinc-300">
          {article.excerpt}
        </p>
      )}

      {/* meta + ações */}
      <div className="mt-6 flex items-center justify-between gap-4 border-y border-white/10 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E0263B] text-[13px] font-bold text-white">
            {author.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-[13px] font-semibold text-zinc-200">Por {author}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-400">
              <Clock3 size={10} /> {timeAgo(article.created_at)} · {readMin} min de leitura
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onSave}
            title={saved ? "Remover dos salvos" : "Salvar"}
            className={`rounded-full border p-2.5 transition ${
              saved ? "border-[#E0263B] bg-[#E0263B]/10 text-[#E0263B]" : "border-white/15 text-zinc-300 hover:border-white/30"
            }`}
          >
            <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
          </button>
          <button
            onClick={onLike}
            title={liked ? "Remover curtida" : "Curtir"}
            className={`rounded-full border p-2.5 transition ${
              liked ? "border-[#E0263B] bg-[#E0263B]/10 text-[#E0263B]" : "border-white/15 text-zinc-300 hover:border-white/30"
            }`}
          >
            <Heart size={17} fill={liked ? "currentColor" : "none"} />
          </button>
          <button
            onClick={onShare}
            title="Compartilhar"
            className="rounded-full border border-white/15 p-2.5 text-zinc-300 transition hover:border-white/30"
          >
            <Share2 size={17} />
          </button>
        </div>
      </div>

      {article.image_url && (
        <div className="my-8 overflow-hidden rounded-xl" style={{ aspectRatio: "16/9" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.image_url} alt={article.title} className="h-full w-full object-cover" />
        </div>
      )}

      {/* corpo */}
      {body ? (
        <div className="reader-body">
          {isHtml ? (
            <div dangerouslySetInnerHTML={{ __html: body }} />
          ) : (
            body
              .split(/\n\n+/)
              .filter(Boolean)
              .map((p, i) => <p key={i}>{p.trim()}</p>)
          )}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-zinc-400">
          Não foi possível carregar o conteúdo desta matéria.
        </p>
      )}

      {/* ── Continue lendo — recomendações em rolagem infinita ── */}
      <section className="mt-14 border-t border-white/10 pt-8">
        {recs.length > 0 && (
          <h2 className="mb-5 flex items-center gap-2 text-[16px] font-extrabold">
            <span className="pro-gradient inline-block h-4 w-1.5 rounded-full" /> Continue lendo
          </h2>
        )}
        <div className="space-y-3">
          {recs.map((a, i) => (
            <Link
              key={`${a.id}-${i}`}
              href={`/app/ler/${a.slug}`}
              className="group flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:bg-white/[0.06]"
            >
              {a.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.image_url} alt="" className="h-[76px] w-[112px] shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="pro-gradient h-[76px] w-[112px] shrink-0 rounded-xl opacity-25" />
              )}
              <div className="min-w-0 flex-1">
                <span className="pro-gradient-text text-[10px] font-black uppercase tracking-widest">
                  {a.category}
                </span>
                <h3 className="mt-0.5 line-clamp-2 text-[15px] font-bold leading-snug group-hover:underline">
                  {a.title}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-zinc-400">
                  <Clock3 size={10} /> {timeAgo(a.created_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
        {!recsDone && <div ref={recsSentinel} className="h-12" />}
        {!recsDone && (
          <div className="flex justify-center py-4 text-zinc-400">
            <Loader2 className="animate-spin" size={18} />
          </div>
        )}
      </section>

      <style>{`
        .reader-body { font-family: Georgia, 'Times New Roman', serif; font-size: 19px; line-height: 1.9; color: #d4d4d8; }
        .reader-body p { margin-bottom: 1.5em; }
        .reader-body h2 { font-size: 27px; font-weight: 800; line-height: 1.2; color: #fafafa; margin: 2em 0 .7em; font-family: Georgia, serif; }
        .reader-body h3 { font-size: 21px; font-weight: 700; line-height: 1.3; color: #f4f4f5; margin: 1.7em 0 .6em; font-family: Georgia, serif; }
        .reader-body blockquote { border-left: 3px solid #9B72CB; padding-left: 1.25rem; margin: 2em 0; color: #a1a1aa; font-style: italic; font-size: 20px; }
        .reader-body a { color: #ff8db0; text-decoration: underline; text-underline-offset: 3px; }
        .reader-body strong { font-weight: 700; color: #ffffff; }
        .reader-body ul, .reader-body ol { padding-left: 1.5rem; margin-bottom: 1.5em; }
        .reader-body li { margin-bottom: .5em; }
        .reader-body img { width: 100%; height: auto; margin: 2em 0; border-radius: 12px; }
        .reader-body hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 2.5em 0; }
      `}</style>
    </article>
  );
}
