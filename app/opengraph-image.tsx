import { ImageResponse } from "next/og";

export const alt = "Monatiza — Notícias, IA, Negócios e Tecnologia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0a0a0a",
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", height: 10, width: 120, background: "#dc2626" }} />
        <div
          style={{
            marginTop: 40,
            fontSize: 140,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-4px",
            fontFamily: "serif",
          }}
        >
          monatiza
        </div>
        <div style={{ marginTop: 24, fontSize: 40, color: "#a1a1aa" }}>
          Notícias · IA · Negócios · Tecnologia
        </div>
      </div>
    ),
    { ...size }
  );
}
