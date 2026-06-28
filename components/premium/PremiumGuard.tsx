"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  MessagesSquare,
  Video,
  Newspaper,
  Bookmark,
  User,
  Sparkles,
  BookOpen,
  Mail,
  LayoutDashboard,
  CreditCard,
  Search,
  LogOut,
  Loader2,
  Crown,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

// Navegação principal (enxuta) — barra de cima (desktop) e barra de baixo (mobile).
const PRIMARY = [
  { href: "/app", label: "Início", icon: Home },
  { href: "/app/comunidade", label: "Comunidade", icon: MessagesSquare },
  { href: "/app/videos", label: "Vídeos", icon: Video },
  { href: "/app/feed", label: "Notícias", icon: Newspaper },
  { href: "/app/biblioteca", label: "Biblioteca", icon: Bookmark },
];

// O resto fica organizado no menu do avatar (não polui a tela).
const MORE = [
  { href: "/app/perfil", label: "Meu perfil", icon: User },
  { href: "/app/exclusivo", label: "Exclusivo", icon: Sparkles },
  { href: "/app/revistas", label: "Revistas", icon: BookOpen },
  { href: "/app/newsletter", label: "Newsletter", icon: Mail },
  { href: "/app/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/app/conta", label: "Conta", icon: CreditCard },
];

// Barra inferior (mobile): 4 principais + Perfil.
const MOBILE = [...PRIMARY.slice(0, 4), { href: "/app/perfil", label: "Perfil", icon: User }];

function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
}

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#f6f7f9] text-zinc-400">
      {children}
    </div>
  );
}

export default function PremiumGuard({ children }: { children: React.ReactNode }) {
  const { loading, isSubscriber, user, status } = useSubscriber();
  const router = useRouter();
  const pathname = usePathname() || "/app";
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/painel/login?next=${encodeURIComponent(pathname)}`);
    } else if (!isSubscriber) {
      router.replace(status === "inactive" || status === "past_due" ? "/painel" : "/assinantes");
    }
  }, [loading, user, isSubscriber, status, pathname, router]);

  // fecha o menu ao trocar de página
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <FullScreen>
        <Loader2 className="animate-spin" size={22} />
        <span className="text-sm">Carregando o MonatizaPro…</span>
      </FullScreen>
    );
  }
  if (!user || !isSubscriber) {
    return (
      <FullScreen>
        <Crown size={22} className="text-[#9B72CB]" />
        <span className="text-sm">Redirecionando…</span>
      </FullScreen>
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const firstName = (user.name || user.email || "Assinante").split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f6f7f9] pb-24 text-[#1f1f24] md:pb-0">
      {/* ── BARRA SUPERIOR ── */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/app" className="flex items-baseline gap-1">
            <span className="text-[22px] font-extrabold tracking-tight text-[#1f1f24]">monatiza</span>
            <span className="pro-gradient-text text-[15px] font-extrabold tracking-tight">pro</span>
          </Link>

          {/* nav principal (desktop) */}
          <nav className="pro-scroll hidden min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto md:flex">
            {PRIMARY.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-full px-4 py-2 text-[13.5px] font-semibold transition ${
                    active ? "pro-gradient text-white shadow-sm" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link
              href="/app/busca"
              className="rounded-full p-2.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
              aria-label="Buscar"
            >
              <Search size={19} />
            </Link>

            {/* avatar + menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="pro-ring rounded-full p-[2px] transition hover:opacity-90"
                aria-label="Menu da conta"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[13px] font-bold text-zinc-800">
                  {initial}
                </span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="pro-pop absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3">
                      <span className="pro-ring rounded-full p-[2px]">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[13px] font-bold text-zinc-800">
                          {initial}
                        </span>
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-bold text-zinc-900">{firstName}</p>
                        <p className="truncate text-[12px] text-zinc-400">{user.email}</p>
                      </div>
                    </div>
                    <nav className="p-1.5">
                      {MORE.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-zinc-700 transition hover:bg-zinc-100"
                          >
                            <Icon size={17} className="text-zinc-400" />
                            {item.label}
                          </Link>
                        );
                      })}
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-zinc-700 transition hover:bg-zinc-100"
                      >
                        <LogOut size={17} className="text-zinc-400" /> Sair
                      </button>
                    </nav>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── CONTEÚDO ── */}
      <main key={pathname} className="pro-pop mx-auto max-w-[1240px] px-4 py-7 md:px-6 md:py-10">
        {children}
      </main>

      {/* ── BARRA INFERIOR (mobile) ── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/70 bg-white/90 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-[640px] items-stretch justify-around px-2">
          {MOBILE.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link key={item.href} href={item.href} className="flex flex-1 flex-col items-center gap-1 py-2.5">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                    active ? "pro-gradient text-white" : "text-zinc-400"
                  }`}
                >
                  <Icon size={20} />
                </span>
                <span className={`text-[10px] font-bold ${active ? "pro-gradient-text" : "text-zinc-400"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
