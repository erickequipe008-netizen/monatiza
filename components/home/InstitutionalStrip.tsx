"use client";

const PILLARS = [
  { label: "Nosso compromisso", title: "Inovação como editoria principal", desc: "Cobrimos o que está reescrevendo o mercado — IA, tecnologia e os negócios que vêm a seguir." },
  { label: "Curadoria", title: "Relevância acima de volume", desc: "Cada matéria publicada passa por critério editorial — sem ruído, sem clickbait." },
  { label: "Design premium", title: "Uma leitura à altura do conteúdo", desc: "Experiência editorial pensada para quem decide rápido e exige profundidade." },
];

interface InstitutionalStripProps {
  dark: boolean;
}

export function InstitutionalStrip({ dark }: InstitutionalStripProps) {
  return (
    <section className={`border-t ${dark ? "border-zinc-800" : "border-zinc-200"}`}>
      <div className={`max-w-[1280px] mx-auto px-4 py-10 md:py-12 grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x ${dark ? "divide-zinc-800" : "divide-zinc-200"}`}>
        {PILLARS.map((item, i) => (
          <div key={i} className={`py-6 ${i > 0 ? "md:pl-8" : ""} ${i < 2 ? "md:pr-8" : ""}`}>
            <span className="text-red-600 text-[11px] font-black uppercase tracking-widest block mb-2">{item.label}</span>
            <h3 className={`text-[18px] font-serif font-bold leading-tight mb-2 ${dark ? "text-white" : "text-zinc-900"}`}>{item.title}</h3>
            <p className={`text-[13px] leading-relaxed ${dark ? "text-zinc-400" : "text-zinc-500"}`}>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
