import "./globals.css";
import Script from "next/script";

export const metadata = {
  metadataBase: new URL("https://monatiza.com"),

  title: "monatiza",

  description:
    "Portal premium de notícias, IA, negócios, tecnologia e mídia digital.",

  verification: {
    google: "IOWIeKcohKK9sb6OBildSWbc781JwP02s6qYSbnhA1A",
  },

  other: {
    "google-adsense-account": "ca-pub-2575495674688917",
  },

  openGraph: {
    title: "monatiza",

    description:
      "Portal premium de notícias.",

    siteName: "MONATIZA",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">

      <body>

        <Script
          id="adsense-script"
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2575495674688917"
          crossOrigin="anonymous"
        />

        {children}

      </body>

    </html>
  );
}