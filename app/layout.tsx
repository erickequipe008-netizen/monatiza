import "./globals.css";
import Script from "next/script";
import CookieBanner from "@/components/CookieBanner";

export const metadata = {
  metadataBase: new URL("https://monatiza.com"),

  title: "Monatiza - Notícias, IA, Negócios e Tecnologia",

  description:
    "Acompanhe notícias sobre inteligência artificial, negócios, tecnologia, startups, economia e tendências digitais no Brasil e no mundo.",

  verification: {
    google: "IOWIeKcohKK9sb6OBildSWbc781JwP02s6qYSbnhA1A",
  },

  other: {
    "google-adsense-account": "ca-pub-2575495674688917",
  },

  openGraph: {
    title: "Monatiza",
    description:
      "Portal premium de notícias sobre IA, negócios, tecnologia e economia.",
    url: "https://monatiza.com",
    siteName: "Monatiza",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "pt_BR",
    type: "website",
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

        {/* BARRA SUPERIOR */}
        <div
          style={{
            background: "#fff",
            height: "34px",

            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 999999,

            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "0 18px",

            borderBottom: "1px solid #ececec",

            fontFamily: "Arial, sans-serif",
          }}
        >

          <a
            href="/brazil"
            style={{
              textDecoration: "none",
              color: "#111",
              fontWeight: 900,
              fontSize: "14px",
            }}
          >
            Monatiza Brazil
          </a>

          <a
            href="/play"
            style={{
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "900",
            }}
          >
            <span style={{ color: "#111" }}>Monatiza</span>
            <span style={{ color: "#0045d9" }}>Play</span>
          </a>

          <a
            href="/life"
            style={{
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "900",
            }}
          >
            <span style={{ color: "#111" }}>Monatiza</span>
            <span style={{ color: "#ffaa00" }}>Life</span>
          </a>

          <a
            href="/empreende"
            style={{
              textDecoration: "none",
              color: "#111",
              fontWeight: 900,
              fontSize: "14px",
            }}
          >
            Empreende
          </a>

        </div>

       {/* CONTEÚDO */}
<div
  style={{
    paddingTop: "110px",
  }}
>
  {children}
</div>

        <CookieBanner />

      </body>
    </html>
  );
}