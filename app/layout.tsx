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

        <div
          style={{
            background: "red",
            color: "white",
            height: "60px",
            display: "flex",
            alignItems: "center",
            paddingLeft: "20px",
            fontWeight: "bold",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 999999,
          }}
        >
          TESTE MONATIZA
        </div>

        {children}

        <CookieBanner />

      </body>
    </html>
  );
}