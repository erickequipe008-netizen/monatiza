"use client";

import { useEffect, useState } from "react";
import { getLang, setLangPref, t as translate, type Lang } from "@/lib/i18n";

// Hook de idioma: pega o idioma detectado/salvo e reage à troca.
export function useLang() {
  const [lang, setLang] = useState<Lang>("pt");

  useEffect(() => {
    const apply = () => {
      const l = getLang();
      setLang(l);
      if (typeof document !== "undefined") document.documentElement.lang = l;
    };
    apply();
    window.addEventListener("monatiza:lang", apply);
    return () => window.removeEventListener("monatiza:lang", apply);
  }, []);

  return {
    lang,
    t: (key: string) => translate(lang, key),
    setLang: (l: Lang) => {
      setLangPref(l);
      setLang(l);
    },
  };
}
