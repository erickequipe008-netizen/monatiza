import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acessibilidade | Monatiza",
  description: "Compromisso da Monatiza com a acessibilidade digital.",
};

export default function AcessibilidadePage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Acessibilidade</h1>
      <p className="text-sm text-neutral-500 mb-8">Última atualização: 3 de julho de 2026</p>

      <div className="space-y-8 text-[1.05rem] leading-relaxed text-neutral-800">
        <p>
          A Monatiza tem o compromisso de oferecer uma experiência acessível a todas as pessoas,
          incluindo aquelas com deficiência. Trabalhamos continuamente para que o site e o aplicativo
          possam ser usados com conforto por todos.
        </p>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">Nossas práticas</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Contraste de cores adequado entre texto e fundo, com temas claro e escuro.</li>
            <li>Navegação por teclado e uso de rótulos (aria-label) nos botões e ícones.</li>
            <li>Textos alternativos em imagens e estrutura semântica de títulos.</li>
            <li>Tamanhos de fonte legíveis e áreas de toque confortáveis no celular.</li>
            <li>Compatibilidade com leitores de tela e com o zoom do navegador.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">Melhoria contínua</h2>
          <p>
            A acessibilidade é um trabalho permanente. Revisamos e aprimoramos a plataforma com
            frequência, seguindo boas práticas reconhecidas internacionalmente, como as diretrizes
            WCAG.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-3">Fale com a gente</h2>
          <p>
            Encontrou alguma barreira de acessibilidade ou tem uma sugestão? Escreva para{" "}
            <a href="mailto:contato@monatiza.com" className="font-semibold text-neutral-900 underline">
              contato@monatiza.com
            </a>
            . Sua mensagem nos ajuda a melhorar.
          </p>
        </section>
      </div>
    </main>
  );
}
