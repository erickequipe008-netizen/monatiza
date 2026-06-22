import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato | Monatiza",
  description: "Entre em contato com a equipe da Monatiza.",
};

export default function ContatoPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">Contato</h1>

      <div className="space-y-5 text-[1.05rem] leading-relaxed text-neutral-800">
        <p>
          A Monatiza é um projeto editorial da MMmidia. Para dúvidas,
          sugestões, parcerias, envio de releases ou questões relacionadas a
          privacidade, utilize o canal abaixo.
        </p>

        <div className="mt-8 space-y-6">
          <div>
            <p className="font-bold text-neutral-900">E-mail</p>
            <p>
              <a
                href="mailto:contato@monatiza.com"
                className="underline underline-offset-2 hover:text-neutral-600"
              >
                contato@monatiza.com
              </a>
            </p>
          </div>

          <div>
            <p className="font-bold text-neutral-900">Endereço</p>
            <p>Av. Paulista, 508 — São Paulo, SP</p>
          </div>

          <div>
            <p className="font-bold text-neutral-900">Razão social</p>
            <p>MMmidia — CNPJ 49.908.875/0001-85</p>
          </div>
        </div>
      </div>
    </main>
  );
}