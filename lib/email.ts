import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

export async function enviarFormularioRevista(
  email: string,
  nome: string,
  token: string
) {
  const link = `https://seudominio.com/editorial/revista/formulario/${token}`;

  await resend.emails.send({
    from: "Revista Empreende Brazil <contato@seudominio.com>",
    to: email,
    subject: "Formulário da Revista Empreende Brazil",
    html: `
      <h2>Olá ${nome}</h2>

      <p>
        Recebemos sua inscrição na Revista Empreende Brazil.
      </p>

      <p>
        Para iniciarmos sua matéria, preencha o formulário:
      </p>

      <a href="${link}">
        Preencher formulário
      </a>

      <p>
        Caso o botão não funcione:
      </p>

      <p>${link}</p>
    `,
  });
}