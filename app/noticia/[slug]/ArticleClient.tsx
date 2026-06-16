"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";

import Link from "next/link";
import Image from "next/image";

import {
  Clock3,
  ChevronRight,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";



// ─── ícones de redes sociais (minimalistas, traço único, sem marca colorida pesada) ───
function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.87.5 3.62 1.44 5.15L2 22l5.13-1.5a9.86 9.86 0 0 0 4.91 1.31h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.51 2 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.91.93-3.03-.2-.31a8.17 8.17 0 0 1-1.26-4.36c0-4.53 3.69-8.22 8.23-8.22 2.2 0 4.27.86 5.82 2.41a8.16 8.16 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.46-.72-1.68-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.96-.15.17-.29.18-.54.06-.25-.12-1.04-.38-1.98-1.21-.73-.65-1.22-1.46-1.37-1.71-.14-.25-.01-.39.11-.51.12-.12.27-.31.4-.46.13-.16.18-.27.27-.45.08-.18.04-.33-.04-.46-.08-.12-.5-1.2-.69-1.65-.18-.43-.37-.37-.51-.38-.13-.01-.28-.01-.43-.01-.15 0-.39.06-.6.27-.21.21-.8.78-.8 1.91 0 1.13.82 2.21.94 2.37.12.15 1.59 2.43 3.87 3.31 1.93.75 2.33.64 2.75.6.42-.04 1.36-.55 1.55-1.09.19-.53.19-.99.13-1.09-.06-.1-.23-.16-.48-.28z" />
    </svg>
  );
}

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.9 2H22l-7.1 8.1L23.3 22H17l-5.4-7.1L5.4 22H2.3l7.6-8.7L1 2h6.4l4.9 6.5L18.9 2zm-2.1 18h1.7L7.3 4H5.5l11.3 16z" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.16 8.44 9.94v-7.03H7.9v-2.91h2.54V9.79c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.78 8.43-4.94 8.43-9.94z" />
    </svg>
  );
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-2.83 2.83a5 5 0 0 0 7.07 7.07L12.5 19.5" />
    </svg>
  );
}

export default function ArticlePage() {

  const params = useParams();

  const slug = params.slug as string;

  const [article, setArticle] =
    useState<any>(null);

  const [related, setRelated] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [copied, setCopied] =
    useState(false);

  useEffect(() => {

    async function loadArticle() {

      setLoading(true);

      const { data, error } =
        await supabase
          .from("articles")
          .select("*")
          .eq("slug", slug)
          .single();

      if (error || !data) {

        console.log(error);

        setLoading(false);
        return;

      }

      setArticle(data);

      const { data: relatedData } =
        await supabase
          .from("articles")
          .select("*")
          .neq("id", data.id)
          .limit(4);

      setRelated(relatedData || []);

      setLoading(false);
    }

    if (slug) {

      loadArticle();

    }

  }, [slug]);

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center text-xl bg-[#f5f5f5]">

        Carregando matéria...

      </div>

    );

  }

  if (!article) {

    return (

      <div className="min-h-screen flex items-center justify-center text-xl bg-[#f5f5f5]">

        Matéria não encontrada.

      </div>

    );

  }

  const currentUrl =
    typeof window !== "undefined"
      ? window.location.href
      : "";

  function handleCopyLink() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

      const jsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",

  headline: article.title,

  image: [article.image_url],

  datePublished: article.created_at,

  dateModified: article.created_at,

  author: {
    "@type": "Person",
    name:
      article.journalist_name ||
      article.author ||
      "Redação Monatiza",
  },

  publisher: {
    "@type": "Organization",
    name: "Monatiza",

    logo: {
      "@type": "ImageObject",
      url: "https://monatiza.com/logo.png",
    },
  },

  description:
    article.description ||
    article.excerpt,

  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `https://monatiza.com/noticia/${article.slug}`,
  },
};

  return (

    <div className="bg-[#f5f5f5] min-h-screen text-black">

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(jsonLd),
  }}
/>

<Header />

      {/* CONTEÚDO */}

      <main className="max-w-[1400px] mx-auto px-4 md:px-5 py-6 md:py-10">

        <div className="
  grid
  grid-cols-1
  lg:grid-cols-12
  gap-6
  md:gap-10
">

          {/* SOCIAL */}

          <div
            className="
              hidden
              lg:flex
              flex-col
              gap-3
              col-span-1
              sticky
              top-32
              h-fit
            "
          >

            <a
              href={`https://wa.me/?text=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Compartilhar no WhatsApp"
              title="Compartilhar no WhatsApp"
              className="
                w-11
                h-11
                rounded-full
                border
                border-zinc-200
                bg-white
                text-zinc-500
                flex
                items-center
                justify-center
                hover:border-[#25D366]
                hover:text-[#25D366]
                hover:scale-105
                transition-all
              "
            >
              <WhatsAppIcon />
            </a>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Compartilhar no Facebook"
              title="Compartilhar no Facebook"
              className="
                w-11
                h-11
                rounded-full
                border
                border-zinc-200
                bg-white
                text-zinc-500
                flex
                items-center
                justify-center
                hover:border-[#1877F2]
                hover:text-[#1877F2]
                hover:scale-105
                transition-all
              "
            >
              <FacebookIcon />
            </a>

            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Compartilhar no X"
              title="Compartilhar no X"
              className="
                w-11
                h-11
                rounded-full
                border
                border-zinc-200
                bg-white
                text-zinc-500
                flex
                items-center
                justify-center
                hover:border-black
                hover:text-black
                hover:scale-105
                transition-all
              "
            >
              <XIcon />
            </a>

            <a
              href="https://instagram.com/monatizabrazil"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Monatiza no Instagram"
              title="Monatiza no Instagram"
              className="
                w-11
                h-11
                rounded-full
                border
                border-zinc-200
                bg-white
                text-zinc-500
                flex
                items-center
                justify-center
                hover:border-[#E4405F]
                hover:text-[#E4405F]
                hover:scale-105
                transition-all
              "
            >
              <InstagramIcon />
            </a>

            <button
              onClick={handleCopyLink}
              aria-label="Copiar link da matéria"
              title={copied ? "Link copiado!" : "Copiar link"}
              className="
                w-11
                h-11
                rounded-full
                border
                border-zinc-200
                bg-white
                text-zinc-500
                flex
                items-center
                justify-center
                hover:border-red-600
                hover:text-red-600
                hover:scale-105
                transition-all
                relative
              "
            >
              <LinkIcon />
              {copied && (
                <span className="absolute left-full ml-3 whitespace-nowrap text-[11px] font-semibold bg-black text-white px-2.5 py-1 rounded-md">
                  Copiado!
                </span>
              )}
            </button>

          </div>

          {/* ARTIGO */}

          <article className="col-span-12 lg:col-span-7">

            <span
              className="
                text-red-600
                font-bold
                uppercase
                text-xs
                tracking-wider
              "
            >

              {article.category}

            </span>

            <h1
              className="
                text-black

                text-[22px]
sm:text-[30px]
md:text-[52px]

                leading-[1.05]

                font-black

                mt-4

                tracking-tight
              "
            >

              {article.title}

            </h1>

            <p
              className="
                text-zinc-600

                text-[18px]
                md:text-[22px]

                mt-6

                leading-relaxed
              "
            >

              {article.excerpt}

            </p>

            {/* SOCIAL MOBILE (só aparece quando a coluna lateral está oculta) */}
            <div className="flex lg:hidden items-center gap-3 mt-6">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Compartilhar no WhatsApp"
                className="w-10 h-10 rounded-full border border-zinc-200 bg-white text-zinc-500 flex items-center justify-center hover:border-[#25D366] hover:text-[#25D366] transition-all"
              >
                <WhatsAppIcon size={16} />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Compartilhar no Facebook"
                className="w-10 h-10 rounded-full border border-zinc-200 bg-white text-zinc-500 flex items-center justify-center hover:border-[#1877F2] hover:text-[#1877F2] transition-all"
              >
                <FacebookIcon size={16} />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Compartilhar no X"
                className="w-10 h-10 rounded-full border border-zinc-200 bg-white text-zinc-500 flex items-center justify-center hover:border-black hover:text-black transition-all"
              >
                <XIcon size={14} />
              </a>
              <button
                onClick={handleCopyLink}
                aria-label="Copiar link"
                className="w-10 h-10 rounded-full border border-zinc-200 bg-white text-zinc-500 flex items-center justify-center hover:border-red-600 hover:text-red-600 transition-all relative"
              >
                <LinkIcon size={16} />
              </button>
              {copied && (
                <span className="text-[12px] font-semibold text-red-600">
                  Link copiado!
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-gray-500 text-sm">
  <span>{article.author}</span>

  <span>•</span>

  <span>
    {new Date(article.created_at).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    )}
  </span>

  <span>•</span>

  <span>5 min leitura</span>
</div>

            <div
              className="
                relative
                w-full

                h-[240px]
                sm:h-[340px]
                md:h-[500px]

                mt-8

                rounded-3xl
                overflow-hidden
              "
            >

              <Image
                src={article.image_url}
                alt={article.title}
                fill
                className="object-cover"
                unoptimized
              />

            </div>

            <div
              className="
                max-w-none

                mt-10

                text-[#1d1d1f]

                font-serif

                [&_p]:text-[16px]
                md:[&_p]:text-[22px]

                [&_p]:leading-[1.9]
                [&_p]:font-normal
                [&_p]:mb-8

                [&_h2]:text-[28px]
                md:[&_h2]:text-[42px]

                [&_h2]:font-bold
                [&_h2]:mt-14
                [&_h2]:mb-6

                [&_strong]:font-semibold

                [&_img]:rounded-2xl
                [&_img]:my-10
              "
              dangerouslySetInnerHTML={{
                __html: `<p>${article.content.replace(/\n/g, "</p><p>")}</p>`,
              }}
            />

          </article>

          {/* SIDEBAR */}

          <aside className="
  hidden
  lg:block
  lg:col-span-4
  mt-10
  lg:mt-0
">
            <h2
              className="
                text-3xl
                font-black
                text-black
                mb-8
              "
            >

              Leia também

            </h2>

            <div className="space-y-10">

              {related.map((item) => (

                <Link
                  key={item.id}
                  href={`/noticia/${item.slug}`}
                  className="
                    block
                    border-b
                    border-zinc-300
                    pb-8
                  "
                >

                  <div
                    className="
                      relative
                      w-full

                      h-[180px]
                      md:h-[220px]

                      rounded-2xl
                      overflow-hidden

                      mb-4
                    "
                  >

                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />

                  </div>

                  <span
                    className="
                      text-red-600
                      uppercase
                      text-xs
                      font-bold
                    "
                  >

                    {item.category}

                  </span>

                  <h3
                    className="
                      text-xl
                      font-bold
                      text-black
                      mt-3
                      leading-snug
                    "
                  >

                    {item.title}

                  </h3>

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      mt-4
                      text-zinc-600
                      text-sm
                    "
                  >

                    <span>Ler matéria</span>

                    <ChevronRight size={16} />

                  </div>

                </Link>

              ))}

            </div>

            {/* NEWSLETTER */}

            <div
              className="
                mt-12

                bg-white

                rounded-3xl

                border
                border-zinc-200

                p-5 md:p-8
              "
            >

              <h3
                className="
                  text-3xl
                  font-black
                  text-black
                "
              >

                Newsletter

              </h3>

              <p
                className="
                  text-zinc-600
                  mt-4
                  leading-relaxed
                "
              >

                Receba notícias exclusivas,
                inteligência artificial,
                mercado financeiro e tendências
                direto no seu e-mail.

              </p>

              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="
                  w-full
                  mt-6

                  border
                  border-zinc-300

                  rounded-2xl

                  px-5
                  py-4

                  outline-none
                "
              />

              <button
                className="
                  w-full

                  bg-black
                  text-white

                  py-4

                  rounded-2xl

                  mt-5

                  font-bold

                  hover:opacity-90
                  transition
                "
              >

                Assinar Agora

              </button>

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}