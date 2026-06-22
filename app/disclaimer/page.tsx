import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | Monatiza",
  description: "Aviso legal (Disclaimer) da Monatiza.",
};

export default function DisclaimerPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">
        Disclaimer
      </h1>

      <div className="space-y-5 text-[1.05rem] leading-relaxed text-neutral-800">
        <p>
          As informações publicadas pela Monatiza, projeto editorial da
          MMmidia, têm caráter exclusivamente informativo e não devem ser
          interpretadas como aconselhamento financeiro, jurídico, médico ou
          de qualquer outra natureza profissional.
        </p>

        <p>
          Conteúdos relacionados a mercado financeiro, investimentos,
          criptomoedas ou indicadores econômicos refletem informações
          disponíveis no momento da publicação e não constituem
          recomendação de compra, venda ou manutenção de qualquer ativo. O
          leitor deve consultar um profissional qualificado antes de tomar
          decisões financeiras.
        </p>

        <p>
          A Monatiza não se responsabiliza por decisões tomadas com base no
          conteúdo publicado, nem por eventuais perdas, danos ou prejuízos
          decorrentes do uso das informações disponibilizadas no site.
        </p>

        <p>
          Embora a Monatiza adote esforços para verificar a precisão das
          informações publicadas, não garante que todo o conteúdo esteja
          livre de erros, estando sujeito a correções e atualizações.
        </p>

        <p>
          Opiniões expressas em artigos assinados, entrevistas ou conteúdos
          de colunistas são de responsabilidade de seus autores e não
          refletem necessariamente a posição editorial da Monatiza.
        </p>

        <p>
          Para dúvidas sobre este aviso legal, entre em contato pelo e-mail{" "}
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