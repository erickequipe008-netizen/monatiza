import "./globals.css";
import Script from "next/script";
import CookieBanner from "@/components/CookieBanner";

export const metadata = {
  metadataBase: new URL("https://monatiza.com"),

  title: "monatiza",

  description:
    "Portal de notícias, IA, negócios, tecnologia e mídia digital.",

  verification: {
    google: "IOWIeKcohKK9sb6OBildSWbc781JwP02s6qYSbnhA1A",
  },

  other: {
    "google-adsense-account": "ca-pub-2575495674688917",
  },

  openGraph: {
    title: "monatiza",
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
        <Script
          id="adsense-script"
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2575495674688917"
          crossOrigin="anonymous"
        />
      </head>

     <body>

  <div className="top-brands">
    <a href="/">monatiza</a>
    <a href="/brazil">monatiza brazil</a>
    <a href="/play">monatiza play</a>
    <a href="/esportes">monatiza esportes</a>
    <a href="/saude">monatiza saúde</a>
    <a href="/life">monatiza life</a>
    <a href="/empreende">empreende</a>
  </div>

  <div style={{ marginTop: "42px" }}>
    {children}
  </div>

  <CookieBanner />

</body>
      
    </html>
  );
}