import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Monatiza",
  description: "Política de Privacidade da Monatiza.",
};

export default function PrivacidadePage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">
        Política de Privacidade
      </h1>
      <p className="text-sm text-neutral-500 mb-8">
        Última atualização: 22 de junho de 2026
      </p>

      <div className="space-y-8 text-[1.05rem] leading-relaxed text-neutral-800">
        <p>
          A Monatiza, projeto editorial da MMmidia (CNPJ
          49.908.875/0001-85), com sede na Av. Paulista, 508, São Paulo,
          SP, respeita a privacidade dos visitantes e leitores de
          www.monatiza.com. Esta Política de Privacidade explica como
          coletamos, usamos, armazenamos e protegemos dados pessoais, em
          conformidade com a Lei Geral de Proteção de Dados (Lei nº
          13.709/2018 — LGPD).
        </p>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            1. Dados que coletamos
          </h2>
          <p>
            Podemos coletar dados fornecidos diretamente por você (como nome
            e e-mail, ao assinar newsletters ou enviar mensagens de
            contato), bem como dados coletados automaticamente durante a
            navegação, como endereço IP, tipo de dispositivo, navegador e
            páginas visitadas.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            2. Como usamos os dados
          </h2>
          <p>
            Utilizamos os dados coletados para operar e melhorar o site,
            personalizar conteúdo, enviar comunicações solicitadas e cumprir
            obrigações legais. Não vendemos dados pessoais a terceiros.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            3. Compartilhamento de dados
          </h2>
          <p>
            Dados podem ser compartilhados com prestadores de serviço que
            apoiam a operação do site (como hospedagem e ferramentas de
            análise de tráfego), sempre sob obrigações contratuais de
            confidencialidade e segurança.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            4. Cookies
          </h2>
          <p>
            O site utiliza cookies para fins de funcionamento e análise de
            audiência. Mais detalhes estão disponíveis em nossa{" "}
            <a
              href="/cookies"
              className="underline underline-offset-2 hover:text-neutral-600"
            >
              Política de Cookies
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            5. Seus direitos
          </h2>
          <p>
            Você pode solicitar, a qualquer momento, acesso, correção,
            exclusão ou portabilidade dos seus dados pessoais, bem como
            revogar consentimentos previamente fornecidos, entrando em
            contato pelo e-mail{" "}
            <a
              href="mailto:contato@monatiza.com"
              className="underline underline-offset-2 hover:text-neutral-600"
            >
              contato@monatiza.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">
            6. Segurança
          </h2>
          <p>
            Adotamos medidas técnicas e organizacionais razoáveis para
            proteger os dados pessoais contra acesso não autorizado,
            perda, alteração ou divulgação indevida.
          </p>
        </section>

      </div>
    </main>
  );
}