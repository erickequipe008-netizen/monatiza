"use client";

interface NewsletterBannerProps {
  dark: boolean;
}

export function NewsletterBanner({ dark }: NewsletterBannerProps) {
  return (
    <section className={`border-t ${dark ? "border-zinc-800 bg-[#111]" : "border-zinc-200 bg-[#f7f7f7]"}`}>
      <div className="max-w-[1280px] mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-red-600 text-[11px] font-black uppercase tracking-widest block mb-1">Newsletter</span>
          <h3 className={`text-[20px] md:text-[22px] font-serif font-bold ${dark ? "text-white" : "text-zinc-900"}`}>
            O futuro dos negócios, direto no seu e-mail
          </h3>
          <p className={`text-[14px] mt-1 ${dark ? "text-zinc-400" : "text-zinc-500"}`}>Inovação, IA e mercado — curadoria semanal sem ruído.</p>
        </div>
        <div className="flex items-center gap-0 w-full md:w-auto">
          <input
            type="email"
            placeholder="Digite seu e-mail"
            className={`h-[50px] px-5 text-[14px] outline-none border bg-transparent w-full md:w-[280px] ${dark ? "border-zinc-700 placeholder:text-zinc-500 text-white" : "border-zinc-300 text-zinc-900"}`}
          />
          <button className="h-[50px] px-7 bg-red-600 text-white font-semibold text-[14px] hover:bg-red-700 transition-colors shrink-0">
            Assinar
          </button>
        </div>
      </div>
    </section>
  );
}
