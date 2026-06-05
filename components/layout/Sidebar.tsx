"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Users,
  Settings,
  LogOut,
  Newspaper,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const nav = [
  { label: "Dashboard",     href: "/admin/dashboard",   icon: LayoutDashboard },
  { label: "Artigos",       href: "/admin/articles",    icon: FileText },
  { label: "Assistente IA", href: "/admin/ai",          icon: Sparkles },
  { label: "Jornalistas",   href: "/admin/journalists", icon: Users },
  { label: "Configurações", href: "/admin/settings",    icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    await supabase.auth.signOut();
    document.cookie = "sb-access-token=; Max-Age=0; path=/";
    window.location.href = "/login";
  }

  return (
    <aside className="
      fixed left-0 top-0 z-40
      h-screen w-[220px]
      bg-white border-r border-gray-100
      flex flex-col
      py-6 px-3
    ">
      {/* Logo */}
      <div className="px-3 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
            <Newspaper size={14} className="text-white" />
          </div>
          <span className="text-sm font-black tracking-tight text-black">
            monatiza
          </span>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 ml-9 font-medium uppercase tracking-widest">
          Editorial
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {nav.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/admin/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-2.5
                px-3 py-2
                rounded-xl
                text-[13px] font-medium
                transition-all duration-100
                ${active
                  ? "bg-black text-white"
                  : "text-gray-500 hover:bg-gray-50 hover:text-black"
                }
              `}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-100 pt-3">
        <button
          onClick={handleLogout}
          className="
            w-full flex items-center gap-2.5
            px-3 py-2 rounded-xl
            text-[13px] font-medium
            text-red-400 hover:bg-red-50 hover:text-red-500
            transition-all duration-100
          "
        >
          <LogOut size={15} />
          Sair
        </button>
      </div>
    </aside>
  );
}