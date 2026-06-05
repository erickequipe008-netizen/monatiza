"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Link from "next/link";
import Image from "next/image";

import {
  Menu,
  Search,
  Moon,
  Clock3,
  ChevronRight,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";

export default function ArticlePage() {

  const params = useParams();

  const slug = params.slug as string;

  const [article, setArticle] =
    useState<any>(null);

  const [related, setRelated] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

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

  return (

    <div className="bg-[#f5f5f5] min-h-screen text-black">

      {/* HEADER */}

      <header className="bg-black text-white border-b border-zinc-800 sticky top-0 z-50">

        <div className="max-w-[1400px] mx-auto px-5 h-[76px] flex items-center justify-between">

          <div className="flex items-center gap-4">

            <button className="hover:opacity-70 transition">
              <Menu size={24} />
            </button>

            <button className="hover:opacity-70 transition">
              <Search size={20} />
            </button>

          </div>

          <Link
            href="/"
            className="text-3xl font-black tracking-tight hover:opacity-80 transition"
          >
            monatiza
          </Link>

          <div className="flex items-center gap-5">

            <button className="hover:opacity-70 transition">
              <Moon size={20} />
            </button>

            <button className="
              border
              border-white
              px-5
              py-2
              text-sm
              font-semibold
              hover:bg-white
              hover:text-black
              transition
            ">

              Assinar

            </button>

          </div>

        </div>

        <div className="border-t border-zinc-800">

          <div className="
            max-w-[1400px]
            mx-auto
            px-5
            h-[50px]
            flex
            items-center
            gap-7
            text-[14px]
            font-semibold
            overflow-x-auto
            whitespace-nowrap
          ">

            <span>Negócios</span>
            <span>IA</span>
            <span>Mercado</span>
            <span>Brasil</span>
            <span>Tech</span>
            <span>Empreende</span>
            <span>Startups</span>
            <span>Carreira</span>
            <span>Assinantes</span>
            <span>Revista</span>

          </div>

        </div>

      </header>

      {/* CONTEÚDO */}

      <main className="max-w-[1400px] mx-auto px-5 py-10">

        <div className="grid grid-cols-12 gap-10">

          {/* SOCIAL */}

          <div className="
            hidden
            lg:flex
            flex-col
            gap-3
            col-span-1
            sticky
            top-32
            h-fit
          ">

            <a
              href={`https://wa.me/?text=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              className="
                w-11
                h-11
                rounded-full
                bg-green-500
                text-white
                flex
                items-center
                justify-center
                text-xs
                font-bold
                hover:scale-105
                transition
              "
            >
              WA
            </a>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              className="
                w-11
                h-11
                rounded-full
                bg-blue-600
                text-white
                flex
                items-center
                justify-center
                text-xs
                font-bold
                hover:scale-105
                transition
              "
            >
              FB
            </a>

            <a
             href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`}
              target="_blank"
              className="
                w-11
                h-11
                rounded-full
                bg-black
                text-white
                flex
                items-center
                justify-center
                text-xs
                font-bold
                border
                border-zinc-700
                hover:scale-105
                transition
              "
            >
              X
            </a>

            <a
              href="https://instagram.com/monatizabrazil"
              target="_blank"
              className="
                w-11
                h-11
                rounded-full
                bg-pink-600
                text-white
                flex
                items-center
                justify-center
                text-xs
                font-bold
                hover:scale-105
                transition
              "
            >
              IG
            </a>

          </div>

          {/* ARTIGO */}

          <article className="col-span-12 lg:col-span-7">

            <span className="
              text-red-600
              font-bold
              uppercase
              text-xs
              tracking-wider
            ">

              {article.category}

            </span>

            <h1 className="
              text-black
              text-3xl
              lg:text-5xl
              leading-tight
              font-black
              mt-4
              tracking-tight
            ">

              {article.title}

            </h1>

            <p className="
              text-zinc-600
              text-lg
              lg:text-xl
              mt-6
              leading-relaxed
            ">

              {article.excerpt}

            </p>

            <div className="
  flex
  items-center
  gap-6
  text-zinc-500
  mt-8
  border-y
  border-zinc-300
  py-4
  text-sm
">

  <span className="font-semibold">
  {article.journalist_name ||
   article.author ||
   "Redação MONATIZA"}
</span>

  <div className="flex items-center gap-2">

    <Clock3 size={16} />

    <span>5 min leitura</span>

  </div>

</div>

            <div className="
              relative
              w-full
              h-[280px]
              lg:h-[500px]
              mt-8
              rounded-3xl
              overflow-hidden
            ">

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

    [&_p]:text-[20px]
    [&_p]:leading-[1.9]
    [&_p]:font-normal
    [&_p]:mb-8

    [&_h2]:text-[36px]
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

          <aside className="col-span-12 lg:col-span-4">

            <h2 className="
              text-3xl
              font-black
              text-black
              mb-8
            ">

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

                  <div className="
                    relative
                    w-full
                    h-[220px]
                    rounded-2xl
                    overflow-hidden
                    mb-4
                  ">

                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />

                  </div>

                  <span className="
                    text-red-600
                    uppercase
                    text-xs
                    font-bold
                  ">

                    {item.category}

                  </span>

                  <h3 className="
                    text-xl
                    font-bold
                    text-black
                    mt-3
                    leading-snug
                  ">

                    {item.title}

                  </h3>

                  <div className="
                    flex
                    items-center
                    gap-2
                    mt-4
                    text-zinc-600
                    text-sm
                  ">

                    <span>Ler matéria</span>

                    <ChevronRight size={16} />

                  </div>

                </Link>

              ))}

            </div>

            {/* NEWSLETTER */}

            <div className="
              mt-12
              bg-white
              rounded-3xl
              border
              border-zinc-200
              p-8
            ">

              <h3 className="
                text-3xl
                font-black
                text-black
              ">

                Newsletter

              </h3>

              <p className="
                text-zinc-600
                mt-4
                leading-relaxed
              ">

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

              <button className="
                w-full
                bg-black
                text-white
                py-4
                rounded-2xl
                mt-5
                font-bold
                hover:opacity-90
                transition
              ">

                Assinar Agora

              </button>

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}