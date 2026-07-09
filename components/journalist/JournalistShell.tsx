"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, FileText, CreditCard, Plus, LogOut, UserRound, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import TutorialModal from "@/components/journalist/TutorialModal";

const NAV = [
  { label: "Início", href: "/dashboard", icon: Home },
  { label: "Publicações", href: "/dashboard/publicacoes", icon: FileText },
  { label: "Créditos", href: "/dashboard/creditos", icon: CreditCard },
  { label: "Perfil", href: "/dashboard/perfil", icon: UserRound },
];

// Barra de abas do mobile (o item central "Publicar" fica em destaque).
const MOBILE_TABS: { label: string; href: string; icon: typeof Home; center?: boolean }[] = [
  { label: "Início", href: "/dashboard", icon: Home },
  { label: "Matérias", href: "/dashboard/publicacoes", icon: FileText },
  { label: "Publicar", href: "/dashboard/novo", icon: Plus, center: true },
  { label: "Créditos", href: "/dashboard/creditos", icon: CreditCard },
  { label: "Perfil", href: "/dashboard/perfil", icon: UserRound },
];

const SUPPORT_WHATSAPP = "5511970841830";
const SUPPORT_EMAIL = "contato@monatiza.com";

export default function JournalistShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [credits, setCredits] = useState(0);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data: c } = await supabase
        .from("journalist_credits")
        .select("balance")
        .eq("journalist_id", user.id)
        .maybeSingle();
      setCredits(c?.balance ?? 0);
      setChecking(false);
    })();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center text-sm text-zinc-400">
        Carregando…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3]" style={{ fontFamily: "sans-serif" }}>
      <header className="sticky top-0 z-40 bg-[#0b0b0c] text-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
              <span className="font-black tracking-tight">MONATIZA</span>
              <span className="hidden sm:inline text-[#E0263B] text-[10px] font-bold uppercase tracking-[0.3em]">
                BrandVoice
              </span>
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {NAV.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
                      active ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon size={15} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard/creditos"
              className="text-xs text-white/80 bg-white/10 hover:bg-white/15 px-3 py-1 rounded-full transition"
              title="Seus créditos"
            >
              {credits} créd.
            </Link>
            <Link
              href="/dashboard/novo"
              className="hidden sm:flex items-center gap-2 bg-[#E0263B] px-3 py-1.5 rounded-lg text-sm font-semibold hover:opacity-90 transition"
            >
              <Plus size={14} />
              Nova publicação
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition"
              title="Sair"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

      </header>

      <TutorialModal />

      {/* Conteúdo — padding extra embaixo no mobile para não ficar sob a barra de abas */}
      <div className="pb-24 sm:pb-0">
        {children}

        {/* Suporte ao colunista */}
        <footer className="mt-10 border-t border-[#E8E6E1] bg-white">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row items-center sm:justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-zinc-400 mb-1">Suporte ao colunista</p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b0b0c] hover:text-[#E0263B] transition"
              >
                <Mail size={14} /> {SUPPORT_EMAIL}
              </a>
            </div>
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent("Olá! Sou colunista da Monatiza e preciso de suporte.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Suporte no WhatsApp
            </a>
          </div>
        </footer>
      </div>

      {/* Barra de abas fixa — apenas no mobile */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#E8E6E1] pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 items-end">
          {MOBILE_TABS.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
            if (item.center) {
              return (
                <Link key={item.href} href={item.href} className="flex flex-col items-center justify-end -mt-4" aria-label={item.label}>
                  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#E0263B] text-white shadow-lg shadow-[#E0263B]/30">
                    <Icon size={22} />
                  </span>
                  <span className="text-[10px] font-semibold text-zinc-500 mt-0.5 mb-1">{item.label}</span>
                </Link>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2.5 ${active ? "text-[#0b0b0c]" : "text-zinc-400"}`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
