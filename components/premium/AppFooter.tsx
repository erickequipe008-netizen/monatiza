"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import { useLang } from "./useLang";
import { LANGS, type Lang } from "@/lib/i18n";

// Rodapé do app (estilo X): links legais + seletor de idioma.
export default function AppFooter({ className = "" }: { className?: string }) {
  const { t, lang, setLang } = useLang();

  const links = [
    { href: "/termos", k: "terms" },
    { href: "/privacy", k: "privacy" },
    { href: "/cookies", k: "cookies" },
    { href: "/acessibilidade", k: "accessibility" },
    { href: "/anuncios", k: "ads_info" },
  ];

  return (
    <div className={`px-2 ${className}`}>
      <nav className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] leading-tight text-zinc-500">
        {links.map((l, i) => (
          <span key={l.href} className="flex items-center gap-3">
            <Link href={l.href} className="hover:underline">
              {t(l.k)}
            </Link>
            {i < links.length - 1 && <span className="text-zinc-700">·</span>}
          </span>
        ))}
      </nav>

      <label className="mt-2.5 flex items-center gap-1.5 text-[12px] text-zinc-500">
        <Globe size={13} />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          aria-label={t("language")}
          className="cursor-pointer bg-transparent text-zinc-400 outline-none hover:text-zinc-200"
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code} className="bg-[#16181c] text-white">
              {l.label}
            </option>
          ))}
        </select>
      </label>

      <p className="mt-2 text-[11px] text-zinc-600">© {new Date().getFullYear()} Monatiza</p>
    </div>
  );
}
