"use client";

export default function Header() {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 999999,
      }}
    >

      {/* DESKTOP */}
      <div className="desktopHeader">

        <div className="leftIcons">
          <span>☰</span>
          <span>⌕</span>
        </div>

        <h1 className="logo">
          monatiza
        </h1>

        <div className="rightIcons">
          <span>☼</span>

          <button>
            Assinar
          </button>
        </div>

      </div>

      {/* MOBILE */}
      <div className="mobileHeader">

        <span className="mobileIcon">
          ☰
        </span>

        <h1 className="mobileLogo">
          monatiza
        </h1>

        <span className="mobileIcon">
          ⌕
        </span>

      </div>

    </div>
  );
}