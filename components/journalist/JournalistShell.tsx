"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, FileText, CreditCard, Plus, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const NAV = [
  { label: "Início", href: "/dashboard", icon: Home },
  { label: "Publicações", href: "/dashboard/publicacoes", icon: FileText },
  { label: "Créditos", href: "/dashboard/creditos", icon: CreditCard },
];

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

        <nav className="sm:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-sm ${
                  active ? "bg-white/10 text-white" : "text-white/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {children}
    </div>
  );
}
