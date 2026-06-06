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
    background: "#fff",
    height: "34px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0 16px",
    borderBottom: "1px solid #ececec",
    fontFamily: "Arial, sans-serif",
  }}
>
  <a href="/brazil" style={{ textDecoration: "none" }}>
    <span style={{ color: "#111", fontWeight: 900 }}>
      Monatiza
    </span>
    <span style={{ color: "#16a34a", fontWeight: 900 }}>
      {" "}Brazil
    </span>
  </a>

  <a
  href="/play"
  style={{
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "900",
    color: "#111",
  }}
>
  Monatiza<span style={{ color: "#2563eb" }}>Play</span>
</a>

<a
  href="/life"
  style={{
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "900",
    color: "#111",
  }}
>
  Monatiza<span style={{ color: "#eab308" }}>Life</span>
</a>

  <a
    href="/empreende"
    style={{
      textDecoration: "none",
      color: "#111",
      fontWeight: 900,
    }}
  >
    Empreende
  </a>
</div>

  <div style={{ paddingTop: "42px" }}>
    {children}
  </div>

  <CookieBanner />

</body>
    </html>
  );
}