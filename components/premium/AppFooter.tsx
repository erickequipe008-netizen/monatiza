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
      <nav className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] leading-snug text-zinc-500">
        {links.map((l, i) => (
          <span key={l.href} className="inline-flex items-center gap-2">
            <Link href={l.href} className="transition hover:text-zinc-300">
              {t(l.k)}
            </Link>
            {i < links.length - 1 && <span className="text-zinc-700">·</span>}
          </span>
        ))}
      </nav>

      <div className="mt-2 flex items-center gap-3 text-[11.5px] text-zinc-500">
        <label className="flex items-center gap-1.5">
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
        <span className="text-zinc-700">·</span>
        <span className="text-zinc-600">© {new Date().getFullYear()} Monatiza</span>
      </div>
    </div>
  );
}
