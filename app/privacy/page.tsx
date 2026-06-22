export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">
        Política de Privacidade
      </h1>

      <p className="mb-4">
        A Monatiza respeita sua privacidade e está comprometida com a proteção
        dos dados pessoais de seus usuários.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        Dados Coletados
      </h2>

      <ul className="list-disc ml-6 space-y-2">
        <li>Nome e informações de contato.</li>
        <li>Endereço IP e dados de navegação.</li>
        <li>Cookies e tecnologias semelhantes.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-4">
        Finalidade
      </h2>

      <p>
        Os dados são utilizados para melhorar a experiência do usuário,
        fornecer suporte, segurança e personalização dos serviços.
      </p>
    </main>
  );
}