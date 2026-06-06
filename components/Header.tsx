"use client";

export default function Header() {
  return (
    <header
      style={{
        position: "fixed",
        top: "34px", // altura da barra branca
        left: 0,
        width: "100%",
        zIndex: 999998,
        background: "#000",
        color: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          height: "78px",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1
          style={{
            fontSize: "58px",
            fontWeight: "900",
            margin: 0,
          }}
        >
          monatiza
        </h1>
      </div>
    </header>
  );
}