"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { MegaMenu } from "@/components/home/MegaMenu";
import { LoginModal } from "@/components/home/LoginModal";
import { SearchModal } from "@/components/home/SearchModal";
import { HeroSection } from "@/components/home/HeroSection";
import { Ticker } from "@/components/home/Ticker";
import { SecondaryGrid } from "@/components/home/SecondaryGrid";
import { ArticleGrid } from "@/components/home/ArticleGrid";
import NewsletterHero from "@/components/home/NewsletterHero";
import { Skeleton } from "@/components/ui/Skeleton";
import CommunityPromo from "@/components/home/CommunityPromo";
import ColumnistsShowcase from "@/components/home/ColumnistsShowcase";
import { ExclusiveSection } from "@/components/home/ExclusiveSection";
import { MagazinesShowcase } from "@/components/home/MagazinesShowcase";
import { CategorySection } from "@/components/home/CategorySection";
import { AdSlot } from "@/components/home/AdSlot";
import HomeSidebar from "@/components/home/HomeSidebar";
import {
  CommercialAd,
  type CommercialAdData,
} from "@/components/home/CommercialAd";
import { ARTICLE_LIST_COLUMNS } from "@/lib/articleFields";
import type { MagazinePublic } from "@/types/magazine";

type Article = any;

export default function HomeClient({
  initialArticles = [],
  initialMagazines = [],
  initialCommercialAd1 = null,
  initialCommercialAd2 = null,
  initialNegociosArticles = [],
  initialIaArticles = [],
  initialMercadoArticles = [],
  initialBrasilArticles = [],
  initialPoliticaArticles = [],
  initialTecnologiaArticles = [],
  initialEmpreendeArticles = [],
  initialStartupsArticles = [],
  initialCarreiraArticles = [],
  initialSaudeArticles = [],
}: {
  initialArticles?: Article[];
  initialMagazines?: MagazinePublic[];

  initialCommercialAd1?: CommercialAdData | null;
  initialCommercialAd2?: CommercialAdData | null;

  initialNegociosArticles?: Article[];
  initialIaArticles?: Article[];
  initialMercadoArticles?: Article[];
  initialBrasilArticles?: Article[];
  initialPoliticaArticles?: Article[];
  initialTecnologiaArticles?: Article[];
  initialEmpreendeArticles?: Article[];
  initialStartupsArticles?: Article[];
  initialCarreiraArticles?: Article[];
  initialSaudeArticles?: Article[];
}) {
  const [darkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [articles, setArticles] =
    useState<Article[]>(initialArticles);

  const [loading, setLoading] = useState(
    initialArticles.length === 0
  );

  useEffect(() => {
    if (initialArticles.length > 0) return;

    async function loadArticles() {
      const { data } = await supabase
        .from("articles")
        .select(ARTICLE_LIST_COLUMNS)
        .eq("status", "publicado")
        .order("created_at", { ascending: false });

      if (data) {
        setArticles(data);
      }

      setLoading(false);
    }

    loadArticles();
  }, [initialArticles.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, []);

  /*
   * =========================================================
   * DISTRIBUIÇÃO DAS NOTÍCIAS DO TOPO
   * =========================================================
   */

  const featured = articles.find(
    (item) => item.image_url
  );

  const rest = articles.filter(
    (item) => item.id !== featured?.id
  );

  const sideArticles = rest.slice(0, 2);
  const secondaryArticles = rest.slice(3, 6);

  // 8 notícias = 4 + 4 no desktop
  const gridArticles = rest.slice(6, 14);

  const tickerArticles = articles.slice(0, 8);

  const dark = darkMode;

  const handleSearch = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      window.location.href = `/busca?q=${encodeURIComponent(
        searchQuery.trim()
      )}`;
    }
  };

  return (
    <>
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(14px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-up {
          animation: fadeUp 0.5s ease forwards;
        }

        .nav-item {
          position: relative;
        }

        .nav-item:hover .nav-underline {
          width: 100%;
        }

        .nav-underline {
          display: block;
          height: 2px;
          background: #dc2626;
          width: 0;
          transition: width 0.2s ease;
          position: absolute;
          bottom: -2px;
          left: 0;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <main
        className={`transition-colors duration-300 ${
          dark
            ? "bg-[#0d0d0d] text-white"
            : "bg-white text-black"
        }`}
      >
        {/* MENU */}
        {menuOpen && (
          <MegaMenu
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={handleSearch}
            onClose={() => setMenuOpen(false)}
            onOpenLogin={() => setLoginOpen(true)}
          />
        )}

        {/* LOGIN */}
        {loginOpen && (
          <LoginModal
            dark={dark}
            onClose={() => setLoginOpen(false)}
          />
        )}

        {/* BUSCA */}
        {searchOpen && (
          <SearchModal
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={handleSearch}
            onClose={() => setSearchOpen(false)}
          />
        )}

        {/* CARREGAMENTO */}
        {loading && (
          <section className="mx-auto max-w-[1280px] px-4 py-10">
            <div className="mb-10 grid grid-cols-1 gap-8 border-b pb-10 lg:grid-cols-[1fr_320px]">
              <div>
                <Skeleton
                  dark={dark}
                  className="mb-4 h-3 w-20"
                />

                <Skeleton
                  dark={dark}
                  className="mb-2 h-10 w-full"
                />

                <Skeleton
                  dark={dark}
                  className="mb-6 h-10 w-3/4"
                />

                <Skeleton
                  dark={dark}
                  className="h-[360px] w-full"
                />
              </div>

              <div className="space-y-5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="space-y-2 border-b pb-5"
                  >
                    <Skeleton
                      dark={dark}
                      className="h-3 w-16"
                    />

                    <Skeleton
                      dark={dark}
                      className="h-4 w-full"
                    />

                    <Skeleton
                      dark={dark}
                      className="h-4 w-2/3"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {!loading && featured && (
          <>
            {/* ==================================================
                TOPO DA HOME - LARGURA COMPLETA
            ================================================== */}
            <section className="fade-up mx-auto max-w-[1280px] px-4 pt-6">

              {/* Publicidade comercial principal no topo da home */}
              <div className="mb-8">
                <CommercialAd ad={initialCommercialAd1} />
              </div>

              <HeroSection
                dark={dark}
                featured={featured}
                sideArticles={sideArticles}
              />

              {/* CHAMADAS COMPLEMENTARES DO DESTAQUE */}
              <div className="grid grid-cols-1 border-b border-zinc-200 sm:grid-cols-3">
                {secondaryArticles.slice(0, 3).map((article, index) => (
                  <a
                    key={article.id}
                    href={`/noticia/${article.slug}`}
                    className={`group block py-5 sm:px-5 ${
                      index > 0 ? "border-t sm:border-l sm:border-t-0 border-zinc-200" : ""
                    }`}
                  >
                    <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-red-600">
                      {article.category || "Em destaque"}
                    </span>

                    <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-zinc-900 transition-colors group-hover:text-red-600">
                      {article.title}
                    </h3>
                  </a>
                ))}
              </div>

              <Ticker
                dark={dark}
                articles={tickerArticles}
              />

              {/* REVISTAS — prioridade no mobile */}
              <div className="lg:hidden">
                <MagazinesShowcase
                  magazines={initialMagazines}
                  dark={dark}
                />
              </div>

              <ColumnistsShowcase />

              <SecondaryGrid
                dark={dark}
                articles={secondaryArticles}
              />

              {/* REVISTAS — posição editorial do desktop */}
              <div className="hidden lg:block">
                <MagazinesShowcase
                  magazines={initialMagazines}
                  dark={dark}
                />
              </div>

              <ArticleGrid
                dark={dark}
                articles={gridArticles}
              />

            </section>

            {/* ==================================================
                CORPO EDITORIAL
                ESQUERDA = CONTEÚDO
                DIREITA = SIDEBAR
            ================================================== */}
            <section className="mx-auto max-w-[1280px] px-4 pb-8">

              <div className="mt-8 border-t border-neutral-200 pt-2">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_330px] xl:gap-12">

                  {/* =============================================
                      COLUNA EDITORIAL PRINCIPAL
                  ============================================= */}
                  <div className="min-w-0">

                    <CategorySection
                      title="Negócios"
                      href="/negocios"
                      dark={dark}
                      articles={initialNegociosArticles}
                    />

                    <CategorySection
                      title="Inteligência Artificial"
                      href="/ia"
                      dark={dark}
                      articles={initialIaArticles}
                    />

                    <CategorySection
                      title="Mercado"
                      href="/mercado"
                      dark={dark}
                      articles={initialMercadoArticles}
                    />

                    <CategorySection
                      title="Brasil"
                      href="/brasil"
                      dark={dark}
                      articles={initialBrasilArticles}
                    />

                    {/* Futuro AdSense dentro do editorial */}
                    <AdSlot />

                    <CategorySection
                      title="Política"
                      href="/politica"
                      dark={dark}
                      articles={initialPoliticaArticles}
                    />

                    <CategorySection
                      title="Tecnologia"
                      href="/tech"
                      dark={dark}
                      articles={initialTecnologiaArticles}
                    />
                  </div>

                  {/* =============================================
                      SIDEBAR
                      No desktop acompanha a área editorial.
                      No celular desce naturalmente.
                  ============================================= */}
                  <div className="min-w-0 border-neutral-200 lg:border-l lg:pl-7 xl:pl-8">
                    <div className="lg:sticky lg:top-5">
                      <HomeSidebar
                        commercialAd1={initialCommercialAd1}
                        commercialAd2={initialCommercialAd2}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================================================
                  CONTEÚDO EXCLUSIVO / ASSINANTES
              ================================================== */}
              <div className="mt-4 border-t border-neutral-200 pt-4">
                <ExclusiveSection
                  dark={dark}
                  articles={articles}
                />
              </div>

              {/* ==================================================
                  SEGUNDA PARTE EDITORIAL
              ================================================== */}
              <div className="mt-4">

                <CategorySection
                  title="Empreende"
                  href="/empreende"
                  dark={dark}
                  articles={initialEmpreendeArticles}
                />

                <CategorySection
                  title="Startups"
                  href="/startups"
                  dark={dark}
                  articles={initialStartupsArticles}
                />

                <CategorySection
                  title="Carreira"
                  href="/carreira"
                  dark={dark}
                  articles={initialCarreiraArticles}
                />

                <CategorySection
                  title="Saúde"
                  href="/saude"
                  dark={dark}
                  articles={initialSaudeArticles}
                />
              </div>

              {/* Futuro AdSense horizontal */}
              <AdSlot />

              <CommunityPromo className="mt-14" />
            </section>
          </>
        )}

        {/* NEWSLETTER PRINCIPAL */}
        {!loading && (
          <NewsletterHero
            images={articles
              .filter(
                (article) => article.image_url
              )
              .map(
                (article) =>
                  article.image_url as string
              )}
          />
        )}
      </main>
    </>
  );
}