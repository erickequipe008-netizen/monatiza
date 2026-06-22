import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre a Monatiza | Monatiza",
  description:
    "Conheça a Monatiza: empresa brasileira de mídia, tecnologia e comunicação especializada em posicionamento digital, produção editorial e distribuição estratégica de conteúdo.",
};

const PORTAIS = [
  { numero: "01", nome: "Negócios", linha: "Estratégia, gestão e mercado" },
  { numero: "02", nome: "IA", linha: "Inteligência artificial aplicada" },
  { numero: "03", nome: "Mercado", linha: "Indicadores e movimentos financeiros" },
  { numero: "04", nome: "Brasil", linha: "Cobertura nacional" },
  { numero: "05", nome: "Tech", linha: "Tecnologia e inovação" },
  { numero: "06", nome: "Empreende", linha: "Empreendedorismo e negócios próprios" },
  { numero: "07", nome: "Startups", linha: "Ecossistema de inovação" },
  { numero: "08", nome: "Carreira", linha: "Mercado de trabalho e desenvolvimento" },
  { numero: "09", nome: "Revista", linha: "Edições digitais e reportagens especiais" },
];

const METRICAS = [
  { valor: "2020", rotulo: "Ano de fundação" },
  { valor: "+7 mil", rotulo: "Marcas e profissionais atendidos" },
  { valor: "9", rotulo: "Portais e verticais" },
  { valor: "2024", rotulo: "Prêmio Comunicação e Jornalismo" },
];

export default function SobrePage() {
  return (
    <main className="bg-white">
      {/* Eyebrow / categoria, no idioma editorial do site */}
      <section className="max-w-6xl mx-auto px-6 pt-10">
        <div className="flex items-center gap-3 text-sm">
          <span className="font-bold text-red-600 tracking-wide">
            SOBRE A MONATIZA
          </span>
          <span className="text-neutral-400">•</span>
          <span className="text-neutral-500">
            Empresa brasileira de mídia e tecnologia
          </span>
        </div>
      </section>

      {/* Manchete principal */}
      <section className="max-w-6xl mx-auto px-6 mt-6">
        <h1 className="font-serif font-bold text-[2.75rem] sm:text-[3.5rem] leading-[1.05] tracking-tight text-neutral-950 max-w-4xl">
          A empresa brasileira que conecta marcas, especialistas e público
          através do jornalismo digital
        </h1>

        <p className="mt-6 text-xl sm:text-2xl leading-relaxed text-neutral-700 max-w-3xl font-light italic">
          Desde 2020, a Monatiza constrói pontes entre quem tem algo relevante
          a dizer e o público que precisa ouvir — através de portais,
          revistas digitais e soluções de posicionamento que já chegaram a
          mais de 7 mil marcas e profissionais.
        </p>

        <div className="mt-8 flex items-center gap-3 text-sm text-neutral-500">
          <span>Atualizado em 22 de junho de 2026</span>
          <span className="text-neutral-300">•</span>
          <span>Leitura de 4 min</span>
        </div>
      </section>

      <div className="border-t border-neutral-200 mt-8" />

      {/* Faixa de métricas, no espírito do ticker de mercado do header */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-neutral-200 border-b border-neutral-200">
          {METRICAS.map((m) => (
            <div key={m.rotulo} className="py-6 px-4 first:pl-0">
              <p className="font-serif font-bold text-3xl sm:text-4xl text-neutral-950">
                {m.valor}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-neutral-500 leading-snug">
                {m.rotulo}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Corpo do texto, layout de matéria com coluna principal + lateral */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
        <div>
          <h2 className="font-serif font-bold text-2xl text-neutral-950 mb-4">
            Nossa história
          </h2>
          <div className="space-y-4 text-[1.05rem] leading-relaxed text-neutral-800">
            <p>
              <span className="text-sm text-neutral-400 align-top mr-1">
                [rascunho — revisar tom]
              </span>
              A Monatiza nasceu em 2020 com um objetivo direto: tornar o
              jornalismo de negócios e tecnologia uma ferramenta de
              posicionamento real para empresas, especialistas e
              empreendedores brasileiros. O que começou como um projeto
              editorial focado em conectar fontes e público se transformou em
              uma operação de mídia com múltiplos portais, revista digital e
              soluções de assessoria de imprensa.
            </p>
            <p>
              Ao longo desses anos, a empresa ampliou sua atuação para áreas
              como inteligência artificial, mercado financeiro, carreira e
              empreendedorismo — sempre mantendo o mesmo compromisso original:
              produzir conteúdo relevante e ajudar quem tem autoridade em seu
              campo a ser encontrado pelas pessoas certas.
            </p>
            <p>
              Hoje, a Monatiza já apoiou o posicionamento digital de mais de
              7 mil marcas e profissionais, e em 2024 foi reconhecida com o
              prêmio de melhor empresa na categoria Comunicação e Jornalismo
              — um marco que reflete o trabalho construído desde a fundação.
            </p>
          </div>

          <h2 className="font-serif font-bold text-2xl text-neutral-950 mt-10 mb-4">
            O que fazemos
          </h2>
          <p className="text-[1.05rem] leading-relaxed text-neutral-800">
            A Monatiza é uma empresa brasileira de mídia, tecnologia e
            comunicação especializada em posicionamento digital, produção
            editorial e distribuição estratégica de conteúdo. Conectamos
            profissionais, empresas e empreendedores ao público por meio de
            notícias, revistas digitais, assessoria de imprensa e soluções de
            autoridade digital — ajudando marcas e especialistas a
            fortalecerem sua presença online e ampliarem sua visibilidade.
          </p>
        </div>

        {/* Lateral: Missão e Visão, como uma caixa "em destaque" do site */}
        <aside className="lg:border-l lg:border-neutral-200 lg:pl-8">
          <p className="text-xs font-bold text-neutral-400 tracking-wide mb-4">
            EM DESTAQUE
          </p>

          <div className="border-b border-neutral-200 pb-6 mb-6">
            <p className="text-xs font-bold text-red-600 tracking-wide mb-2">
              MISSÃO
            </p>
            <p className="text-[0.95rem] leading-relaxed text-neutral-800">
              Conectar profissionais, empresas e empreendedores ao público
              por meio de conteúdos relevantes, notícias, revistas digitais e
              soluções de autoridade digital.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-red-600 tracking-wide mb-2">
              VISÃO
            </p>
            <p className="text-[0.95rem] leading-relaxed text-neutral-800">
              Ser uma das principais plataformas de mídia digital e
              posicionamento empresarial da América Latina.
            </p>
          </div>
        </aside>
      </section>

      <div className="border-t border-neutral-200" />

      {/* Lista de portais — numeração 01-09, justificada por ser uma lista real e ordenada */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="font-serif font-bold text-2xl text-neutral-950 mb-1">
          Nossos portais e verticais
        </h2>
        <p className="text-neutral-500 mb-8">
          Conteúdo segmentado por área, sob um único compromisso editorial.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
          {PORTAIS.map((portal) => (
            <div
              key={portal.numero}
              className="flex items-start gap-4 py-5 border-b border-neutral-200"
            >
              <span className="font-serif font-bold text-2xl text-neutral-300 leading-none">
                {portal.numero}
              </span>
              <div>
                <p className="font-bold text-neutral-950">{portal.nome}</p>
                <p className="text-sm text-neutral-500 mt-0.5">
                  {portal.linha}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Faixa final de reconhecimento — prêmio 2024, tratado como uma "breaking" sutil */}
      <section className="bg-neutral-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-xs font-bold text-red-500 tracking-wide mb-3">
              RECONHECIMENTO
            </p>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl leading-snug max-w-xl">
              Eleita melhor empresa na categoria Comunicação e Jornalismo em
              2024
            </h2>
          </div>
          <a
            href="/contact"
            className="shrink-0 border border-white/30 px-6 py-3 text-sm font-bold tracking-wide hover:bg-white hover:text-neutral-950 transition-colors text-center"
          >
            FALE COM A MONATIZA
          </a>
        </div>
      </section>
    </main>
  );
}