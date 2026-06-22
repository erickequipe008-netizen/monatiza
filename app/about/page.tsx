import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre a Monatiza",
  description:
    "A Monatiza é um projeto editorial da MMidia, com atualização permanente, que disponibiliza notícias e outras informações em português.",
};

export default function SobrePage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">
        Sobre a Monatiza
      </h1>

      <div className="space-y-5 text-[1.05rem] leading-relaxed text-neutral-800">
        <p>
          A Monatiza é um projeto editorial da MMidia, acessível através do
          endereço{" "}
          <a
            href="https://www.monatiza.com"
            className="text-neutral-900 underline underline-offset-2 hover:text-neutral-600"
          >
            www.monatiza.com
          </a>
          , com atualização permanente, que disponibiliza notícias e outras
          informações úteis em português.
        </p>

        <p>
          A Monatiza é uma publicação pluralista, independente, isenta,
          rigorosa e objetiva.
        </p>

        <p>
          A Monatiza compromete-se a respeitar a privacidade dos cidadãos,
          recusando a devassa de factos da vida pessoal e familiar, bem como
          a respeitar a legislação aplicável em vigor.
        </p>

        <p>
          A Monatiza diferencia claramente os conteúdos informativos dos
          opinativos, reservando-se o direito de emitir considerações sobre
          todas as notícias, em editorial, nos termos da legislação
          aplicável em vigor.
        </p>

        <p>
          A Monatiza fomenta a interatividade com os leitores, promovendo a
          sua participação, de acordo com os direitos e deveres inerentes à
          liberdade de expressão e ao direito de informar. A Monatiza
          reserva-se o direito de filtrar essa participação, sempre que tal
          seja considerado necessário.
        </p>
      </div>
    </main>
  );
}