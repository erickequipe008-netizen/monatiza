import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Informações sobre anúncios | Monatiza",
  description: "Como funcionam os anúncios e o conteúdo patrocinado na Monatiza.",
};

export default function AnunciosPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Informações sobre anúncios</h1>
      <p className="text-sm text-neutral-500 mb-8">Última atualização: 3 de julho de 2026</p>

      <div className="space-y-8 text-[1.05rem] leading-relaxed text-neutral-800">
        <p>
          A Monatiza pode exibir anúncios e conteúdos patrocinados para manter o jornalismo e a
          plataforma gratuitos. Esta página explica, de forma simples, como isso funciona.
        </p>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">Identificação dos anúncios</h2>
          <p>
            Todo conteúdo pago é identificado com a marcação <strong>“Anúncio”</strong> ou
            <strong> “Patrocinado”</strong>, para que você sempre saiba o que é publicidade e o que é
            conteúdo editorial.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">Como os anúncios são escolhidos</h2>
          <p>
            Os anúncios podem ser exibidos com base em informações não sensíveis, como o assunto que
            você está lendo, a região aproximada e as preferências do seu navegador. No ambiente de
            assinante, a experiência é <strong>sem anúncios</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">Seu controle</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Você pode gerenciar cookies e preferências de publicidade no seu navegador.</li>
            <li>No app, você pode marcar “Não tenho interesse” para ajustar as recomendações.</li>
            <li>Assinantes navegam sem anúncios em todo o ambiente exclusivo.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">Dúvidas</h2>
          <p>
            Para falar sobre anúncios ou parcerias, escreva para{" "}
            <a href="mailto:contato@monatiza.com" className="font-semibold text-neutral-900 underline">
              contato@monatiza.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
