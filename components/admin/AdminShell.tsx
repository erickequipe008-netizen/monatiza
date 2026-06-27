"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, ClipboardCheck, FileText, CreditCard, User, Plus, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Aprovação", href: "/admin/aprovacao", icon: ClipboardCheck },
  { label: "Artigos", href: "/admin/articles", icon: FileText },
  { label: "Créditos", href: "/admin/creditos", icon: CreditCard },
  { label: "Perfil", href: "/admin/settings", icon: User },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [name, setName] = useState("");

  // A página de login não recebe o shell.
  const bare = pathname === "/admin/login";

  useEffect(() => {
    if (bare) return;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      // jornalista (papel definido e diferente de admin) vai pro próprio dashboard
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (prof && prof.role && prof.role !== "admin") {
        router.push("/dashboard");
        return;
      }
      const meta = (user.user_metadata ?? {}) as { display_name?: string; name?: string };
      setName(meta.display_name || meta.name || user.email || "");
    })();
  }, [bare, router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  if (bare) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <header className="sticky top-0 z-40 bg-[#0b0b0c] text-white" style={{ fontFamily: "sans-serif" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <Link href="/admin/dashboard" className="flex items-center gap-2 shrink-0">
              <span className="font-black tracking-tight">MONATIZA</span>
              <span className="hidden sm:inline text-[#E0263B] text-[10px] font-bold uppercase tracking-[0.3em]">
                Painel
              </span>
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {NAV.map((item) => {
                const active = pathname.startsWith(item.href);
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
              href="/admin/articles/new"
              className="hidden sm:flex items-center gap-2 bg-[#E0263B] px-3 py-1.5 rounded-lg text-sm font-semibold hover:opacity-90 transition"
            >
              <Plus size={14} />
              Nova matéria
            </Link>
            {name && <span className="hidden md:block text-xs text-white/50 max-w-[160px] truncate">{name}</span>}
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

        {/* navegação mobile */}
        <nav className="sm:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
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
