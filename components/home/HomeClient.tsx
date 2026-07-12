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
import InstagramSection from "@/components/home/InstagramSection";
import { ExclusiveSection } from "@/components/home/ExclusiveSection";
import { ARTICLE_LIST_COLUMNS } from "@/lib/articleFields";

export default function HomeClient({
  initialArticles = [],
}: {
  initialArticles?: any[];
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<any[]>(initialArticles);
  const [loading, setLoading] = useState(initialArticles.length === 0);

  // Só busca no cliente se o servidor não trouxe dados (fallback de robustez).
  useEffect(() => {
    if (initialArticles.length > 0) return;
    async function loadArticles() {
      const { data } = await supabase
        .from("articles")
        .select(ARTICLE_LIST_COLUMNS)
        .eq("status", "publicado")
        .order("created_at", { ascending: false });
      if (data) setArticles(data);
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
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const featured = articles.find((item) => item.image_url);
  const rest = articles.filter((item) => item.id !== featured?.id);
  const sideArticles = rest.slice(0, 3);
  const secondaryArticles = rest.slice(3, 6);
  const gridArticles = rest.slice(6, 12);
  const tickerArticles = articles.slice(0, 8);

  const dark = darkMode;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/busca?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes fadeUp { 0% { opacity: 0; transform: translateY(14px); } 100% { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .nav-item { position: relative; }
        .nav-item:hover .nav-underline { width: 100%; }
        .nav-underline { display: block; height: 2px; background: #dc2626; width: 0; transition: width 0.2s ease; position: absolute; bottom: -2px; left: 0; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <main className={`transition-colors duration-300 ${dark ? "bg-[#0d0d0d] text-white" : "bg-white text-black"}`}>
        {menuOpen && (
          <MegaMenu
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={handleSearch}
            onClose={() => setMenuOpen(false)}
            onOpenLogin={() => setLoginOpen(true)}
          />
        )}

        {loginOpen && <LoginModal dark={dark} onClose={() => setLoginOpen(false)} />}

        {searchOpen && (
          <SearchModal
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={handleSearch}
            onClose={() => setSearchOpen(false)}
          />
        )}

        {loading && (
          <section className="max-w-[1280px] mx-auto px-4 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 border-b pb-10 mb-10">
              <div>
                <Skeleton dark={dark} className="h-3 w-20 mb-4" />
                <Skeleton dark={dark} className="h-10 w-full mb-2" />
                <Skeleton dark={dark} className="h-10 w-3/4 mb-6" />
                <Skeleton dark={dark} className="w-full h-[360px]" />
              </div>
              <div className="space-y-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2 pb-5 border-b">
                    <Skeleton dark={dark} className="h-3 w-16" />
                    <Skeleton dark={dark} className="h-4 w-full" />
                    <Skeleton dark={dark} className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {!loading && featured && (
          <section className="max-w-[1280px] mx-auto px-4 pt-6 pb-0 fade-up">
            <HeroSection dark={dark} featured={featured} sideArticles={sideArticles} />
            <Ticker dark={dark} articles={tickerArticles} />

            {/* ── FRISO DE COLUNISTAS (logo abaixo da capa) ── */}
            <ColumnistsShowcase />

            <SecondaryGrid dark={dark} articles={secondaryArticles} />

            {/* ── CONTEÚDO EXCLUSIVO (premium) ── */}
            <ExclusiveSection dark={dark} articles={articles} />

            <ArticleGrid dark={dark} articles={gridArticles} />

            {/* ── COMUNIDADE / APP (uma vez, ao fim do fluxo editorial) ── */}
            <CommunityPromo className="mt-12" />
          </section>
        )}

        {/* ── INSTAGRAM ── */}
        {!loading && (
          <InstagramSection images={articles.filter((a) => a.image_url).map((a) => a.image_url as string)} />
        )}

        {/* ── NEWSLETTER (fim da capa) ── */}
        {!loading && <NewsletterHero />}
      </main>
    </>
  );
}
