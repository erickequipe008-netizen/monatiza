import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies | Monatiza",
  description: "Política de Cookies da Monatiza.",
};

export default function CookiesPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">
        Política de Cookies
      </h1>
      <p className="text-sm text-neutral-500 mb-8">
        Última atualização: 22 de junho de 2026
      </p>

      <div className="space-y-8 text-[1.05rem] leading-relaxed text-neutral-800">
        <p>
          Este site, www.monatiza.com, projeto editorial da MMmidia, utiliza
          cookies para melhorar a experiência de navegação, entender como o
          conteúdo é consumido e personalizar a exibição de informações.
        </p>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            1. O que são cookies
          </h2>
          <p>
            Cookies são pequenos arquivos de texto armazenados no seu
            dispositivo quando você visita um site. Eles permitem que o site
            reconheça seu navegador e lembre certas informações.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            2. Tipos de cookies que utilizamos
          </h2>
          <p>
            <span className="font-bold">Cookies essenciais</span> — necessários
            para o funcionamento básico do site.
          </p>
          <p>
            <span className="font-bold">Cookies de desempenho e análise</span> —
            ajudam a entender como os visitantes interagem com o site, como
            páginas mais acessadas e tempo de permanência.
          </p>
          <p>
            <span className="font-bold">Cookies de publicidade</span> —
            utilizados, quando aplicável, para exibir anúncios mais
            relevantes com base no comportamento de navegação.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            3. Como gerenciar cookies
          </h2>
          <p>
            Você pode controlar e/ou excluir cookies conforme desejar,
            diretamente nas configurações do seu navegador. A desativação de
            cookies pode afetar algumas funcionalidades do site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            4. Cookies de terceiros
          </h2>
          <p>
            Podemos utilizar serviços de terceiros, como ferramentas de
            análise de tráfego, que também podem instalar cookies próprios
            durante sua visita ao site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            5. Mais informações
          </h2>
          <p>
            Para dúvidas sobre esta Política de Cookies, entre em contato
            pelo e-mail{" "}
            <a
              href="mailto:contato@monatiza.com"
              className="underline underline-offset-2 hover:text-neutral-600"
            >
              contato@monatiza.com
            </a>
            . Veja também nossa{" "}
            <a
              href="/privacy"
              className="underline underline-offset-2 hover:text-neutral-600"
            >
              Política de Privacidade
            </a>
            .
          </p>
        </section>

      </div>
    </main>
  );
}