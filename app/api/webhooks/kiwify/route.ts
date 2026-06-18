import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend } from "@/lib/resend";

export async function POST(req: Request) {
try {
const body = await req.json();


console.log("WEBHOOK:", body);

const produto =
  body.product_name ||
  body.Product?.name ||
  "";

if (produto !== "Revista Empreende Brazil") {
  return NextResponse.json({
    success: true,
    ignored: true,
  });
}

const existe = await supabaseAdmin
  .from("magazine_orders")
  .select("id")
  .eq("order_id", body.order_id)
  .single();

if (existe.data) {
  return NextResponse.json({
    success: true,
    duplicated: true,
  });
}

const token = uuidv4();

const { data, error } = await supabaseAdmin
  .from("magazine_orders")
  .insert({
    order_id: body.order_id,
    product_id: body.product_id,

    nome: body.customer_name,
    email: body.customer_email,
    telefone: body.customer_phone,

    plano: produto,
    token,
    status: "novo",
  })
  .select();

if (error) {
  console.error("SUPABASE ERROR:", error);

  return NextResponse.json(
    {
      success: false,
      error,
    },
    {
      status: 500,
    }
  );
}

const formularioUrl =
  `https://monatiza.com/editorial/revista/formulario/${token}`;

try {
  await resend.emails.send({
    from: "Revista Empreende Brazil <revista@monatiza.com>",
    to: body.customer_email,
    subject: "Preencha seu formulário da Revista Empreende Brazil",
    html: `
      <div style="font-family: Arial; padding: 30px;">
        <h2>Olá ${body.customer_name}</h2>

        <p>
          Recebemos sua inscrição na
          Revista Empreende Brazil.
        </p>

        <p>
          Para iniciarmos a produção da sua matéria,
          preencha o formulário abaixo:
        </p>

        <p style="margin-top:30px">
          <a
            href="${formularioUrl}"
            style="
              background:#000;
              color:#fff;
              padding:14px 24px;
              border-radius:8px;
              text-decoration:none;
              display:inline-block;
            "
          >
            Preencher Formulário
          </a>
        </p>

        <br />

        <p>
          Equipe Empreende Brazil
        </p>
      </div>
    `,
  });

  console.log("EMAIL ENVIADO");
} catch (emailError) {
  console.error("ERRO EMAIL:", emailError);
}

return NextResponse.json({
  success: true,
  data,
});

} catch (error: any) {
console.error("ERRO WEBHOOK:", error);


return NextResponse.json(
  {
    success: false,
    error: error?.message,
  },
  {
    status: 500,
  }
);

}
}
