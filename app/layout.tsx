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
    background: "#ffffff",
    height: "34px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "0 18px",
    borderBottom: "1px solid #ececec",
    overflowX: "auto",
    whiteSpace: "nowrap",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 999999,
    fontFamily: "Arial, sans-serif",
  }}
>

 <a
  href="/brazil"
  style={{
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "800",
    color: "#111",
    letterSpacing: "-0.3px",
  }}
>
  Monatiza <span style={{ color: "#16a34a" }}>Brazil</span>
</a>

<a
  href="/life"
  style={{
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "800",
    color: "#111",
    letterSpacing: "-0.3px",
  }}
>
  Monatiza<span style={{ color: "#eab308" }}>Life</span>
</a>

<a
  href="/play"
  style={{
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "800",
    color: "#111",
    letterSpacing: "-0.3px",
  }}
>
  Monatiza<span style={{ color: "#2563eb" }}>Play</span>
</a>

<a
  href="/empreende"
  style={{
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "900",
    color: "#111",
    letterSpacing: "-0.4px",
  }}
>
  Empreende
</a>

<a
  href="/empreende"
  style={{
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "900",
    color: "#111",
    letterSpacing: "-0.4px",
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