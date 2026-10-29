"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { ADSENSE_CLIENT } from "@/lib/ads";
import { isAdEligiblePath } from "@/lib/ads-areas";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

/**
 * Carrega o script do Google AdSense apenas:
 *  • para quem NÃO é assinante ativo; e
 *  • em páginas do portal PÚBLICO (nunca em /app, /admin, /dashboard,
 *    /editorial ou /painel — as áreas de trabalho ficam limpas).
 *
 * Como o script permanece na página após navegação interna, também
 * pausamos as requisições de anúncio ao entrar numa área privada e
 * retomamos ao voltar para o portal público.
 */
export default function AdScripts() {
  const { loading, isSubscriber } = useSubscriber();
  const pathname = usePathname();
  const eligible = isAdEligiblePath(pathname);

  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.pauseAdRequests = eligible ? 0 : 1;
    } catch {
      /* script ainda não carregou — sem problema */
    }
  }, [eligible]);

  if (loading || isSubscriber || !eligible) return null;

  return (
    <Script
      id="adsense-script"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}
