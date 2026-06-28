"use client";

import Script from "next/script";
import { ADSENSE_CLIENT } from "@/lib/ads";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

/**
 * Carrega o script do Google AdSense apenas para quem NÃO é assinante ativo.
 * Assinante navega em todo o site sem anúncios — nem o script é baixado.
 *
 * Enquanto o estado de assinatura está carregando, não injeta nada (evita
 * piscar anúncios para quem é assinante). Para o visitante o script entra
 * logo após a hidratação — diferença imperceptível.
 */
export default function AdScripts() {
  const { loading, isSubscriber } = useSubscriber();
  if (loading || isSubscriber) return null;

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
