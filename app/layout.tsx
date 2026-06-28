import "./globals.css";
import Script from "next/script";
import SiteFrame from "@/components/SiteFrame";
import SubscriberProvider from "@/components/premium/SubscriberProvider";
import AdScripts from "@/components/ads/AdScripts";

export const metadata = {
  metadataBase: new URL("https://www.monatiza.com"),

  title: {
    default: "Monatiza - Notícias, IA, Negócios e Tecnologia",
    template: "%s | Monatiza",
  },

  description:
    "Acompanhe notícias sobre inteligência artificial, negócios, tecnologia, startups, economia e tendências digitais no Brasil e no mundo.",

  verification: {
    google: "IOWIeKcohKK9sb6OBildSWbc781JwP02s6qYSbnhA1A",
  },

  other: {
    "google-adsense-account": "ca-pub-2575495674688917",
  },

  alternates: {
    canonical: "https://www.monatiza.com",
  },

  openGraph: {
    title: "Monatiza",
    description:
      "Portal premium de notícias sobre IA, negócios, tecnologia e economia.",
    url: "https://www.monatiza.com",
    siteName: "Monatiza",
    locale: "pt_BR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Monatiza",
    description:
      "Portal premium de notícias sobre IA, negócios, tecnologia e economia.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="preconnect"
          href="https://cmfuphjxdhqslhvlvesu.supabase.co"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <Script
          id="cookieyes"
          src="https://cdn-cookieyes.com/client_data/e1fd1ac7ad976fb79e788aa18623b15c/script.js"
          strategy="beforeInteractive"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {/* O AdSense (script + anúncios) só carrega para quem NÃO é assinante. */}
        <SubscriberProvider>
          <AdScripts />
          <SiteFrame>{children}</SiteFrame>
        </SubscriberProvider>
      </body>
    </html>
  );
}