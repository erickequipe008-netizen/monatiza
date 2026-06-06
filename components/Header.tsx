"use client";

export default function Header() {
  return (
    <>

      {/* TOP BRANDS */}
      <div
        className="
          w-full
          h-[42px]
          bg-white
          border-b
          border-zinc-200
          flex
          items-center
          gap-6
          px-5
          overflow-x-auto
          whitespace-nowrap
          text-black
          text-[14px]
          font-bold
        "
      >

        <a href="/">monatiza</a>

        <a href="/brazil">
          monatiza brazil
        </a>

        <a href="/play">
          monatiza play
        </a>

        <a href="/esportes">
          monatiza esportes
        </a>

        <a href="/saude">
          monatiza saúde
        </a>

        <a href="/life">
          monatiza life
        </a>

        <a href="/empreende">
          empreende
        </a>

      </div>

      {/* HEADER */}
      <header
        className="
          sticky top-0 z-40
          bg-black text-white
        "
      >
        <div className="max-w-[1600px] mx-auto h-[78px] px-5 flex items-center justify-between">

          <h1 className="text-3xl font-bold">
            MONATIZA
          </h1>

        </div>
      </header>

    </>
  );
}