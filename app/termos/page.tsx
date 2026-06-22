import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | Monatiza",
  description: "Termos de Uso da Monatiza.",
};

export default function TermosPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">
        Termos de Uso
      </h1>
      <p className="text-sm text-neutral-500 mb-8">
        Última atualização: 22 de junho de 2026
      </p>

      <div className="space-y-8 text-[1.05rem] leading-relaxed text-neutral-800">
        <p>
          Estes Termos de Uso regulam o acesso e a utilização do site
          www.monatiza.com, projeto editorial da MMmidia (CNPJ
          49.908.875/0001-85), com sede na Av. Paulista, 508, São Paulo,
          SP. Ao acessar o site, o usuário concorda com os termos descritos
          a seguir.
        </p>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            1. Uso do conteúdo
          </h2>
          <p>
            Todo o conteúdo publicado na Monatiza — textos, imagens, vídeos e
            demais materiais — é protegido por direitos de autor. A
            reprodução total ou parcial sem autorização prévia é proibida,
            salvo nos casos permitidos por lei, como citação com a devida
            referência à fonte.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            2. Conduta do usuário
          </h2>
          <p>
            O usuário compromete-se a utilizar o site de forma lícita,
            respeitosa e em conformidade com a legislação aplicável,
            abstendo-se de praticar atos que violem direitos de terceiros ou
            comprometam a segurança e o funcionamento da plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            3. Comentários e participação
          </h2>
          <p>
            Quando disponíveis, espaços de comentários e interação destinam-se
            ao debate respeitoso. A Monatiza reserva-se o direito de
            moderar, ocultar ou remover conteúdos que violem a lei, incitem
            discurso de ódio, violência ou contenham informações falsas.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            4. Links externos
          </h2>
          <p>
            O site pode conter links para páginas de terceiros. A Monatiza
            não se responsabiliza pelo conteúdo, políticas ou práticas
            adotadas por sites externos.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            5. Limitação de responsabilidade
          </h2>
          <p>
            A Monatiza adota esforços razoáveis para garantir a precisão das
            informações publicadas, mas não garante a ausência total de
            erros, omissões ou indisponibilidades temporárias do site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            6. Alterações destes termos
          </h2>
          <p>
            Estes Termos de Uso podem ser atualizados periodicamente, sem
            aviso prévio. Recomenda-se a revisão regular desta página.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            7. Contato
          </h2>
          <p>
            Dúvidas sobre estes termos podem ser enviadas para{" "}
            <a
              href="mailto:contato@monatiza.com"
              className="underline underline-offset-2 hover:text-neutral-600"
            >
              contato@monatiza.com
            </a>
            .
          </p>
        </section>

      </div>
    </main>
  );
}