import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política Editorial | Monatiza",
  description: "Política Editorial da Monatiza.",
};

export default function PoliticaEditorialPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">
        Política Editorial
      </h1>

      <div className="space-y-5 text-[1.05rem] leading-relaxed text-neutral-800">
        <p>
          A Monatiza, projeto editorial da MMmidia, pauta-se por princípios
          de pluralismo, independência, isenção, rigor e objetividade na
          produção e publicação de conteúdo.
        </p>

        <p>
          A Monatiza diferencia claramente os conteúdos informativos dos
          opinativos. Matérias de caráter informativo seguem critérios de
          apuração, contraditório e verificação de fontes, enquanto
          conteúdos de opinião — como editoriais e artigos assinados —
          são identificados como tal e refletem o ponto de vista de quem os
          assina.
        </p>

        <p>
          A Monatiza reserva-se o direito de emitir considerações sobre
          fatos noticiados, em formato editorial, nos termos da legislação
          aplicável em vigor.
        </p>

        <p>
          Erros factuais identificados em matérias publicadas são corrigidos
          com a maior brevidade possível, com indicação clara da correção
          realizada, sempre que a alteração impactar o entendimento do
          conteúdo original.
        </p>

        <p>
          Conteúdos patrocinados, publicitários ou produzidos em parceria
          comercial são identificados de forma explícita, distinguindo-se
          claramente do conteúdo jornalístico independente.
        </p>

        <p>
          A Monatiza compromete-se a respeitar a privacidade dos cidadãos,
          recusando a devassa de factos da vida pessoal e familiar sem
          interesse público legítimo, bem como a respeitar a legislação
          aplicável em vigor.
        </p>

        <p>
          Dúvidas, sugestões ou contestações sobre conteúdos publicados
          podem ser enviadas para{" "}
          <a
            href="mailto:contato@monatiza.com"
            className="underline underline-offset-2 hover:text-neutral-600"
          >
            contato@monatiza.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}