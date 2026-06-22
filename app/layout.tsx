import "./globals.css";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
        {/* COOKIEYES */}
        <Script
          id="cookieyes"
          src="https://cdn-cookieyes.com/client_data/e1fd1ac7ad976fb79e788aa18623b15c/script.js"
          strategy="beforeInteractive"
        />

        {/* ADSENSE */}
        <Script
          id="adsense-script"
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2575495674688917"
          crossOrigin="anonymous"
        />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
      </head>

    <body>
  <Header />
  {children}
  <Footer />
</body>
    </html>
  );
}