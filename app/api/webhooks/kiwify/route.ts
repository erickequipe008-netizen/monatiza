import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("====================================");
    console.log("WEBHOOK RECEBIDO:");
    console.log(JSON.stringify(body, null, 2));
    console.log("====================================");

    const produto =
      body?.Product?.product_name ||
      body?.product_name ||
      "";

    console.log("PRODUTO:", produto);

    if (produto !== "Revista Empreende Brazil") {
      console.log("PRODUTO IGNORADO");

      return NextResponse.json({
        success: true,
        ignored: true,
      });
    }

    const orderId =
      body?.order_id ||
      body?.order_ref;

    const productId =
      body?.Product?.product_id ||
      null;

    const nome =
      body?.Customer?.full_name ||
      body?.customer_name ||
      "";

    const email =
      body?.Customer?.email ||
      body?.customer_email ||
      "";

    const telefone =
      body?.Customer?.mobile ||
      body?.customer_phone ||
      "";

    console.log("ORDER ID:", orderId);
    console.log("EMAIL CLIENTE:", email);
    console.log("NOME CLIENTE:", nome);

    const existe = await supabaseAdmin
      .from("magazine_orders")
      .select("id")
      .eq("order_id", orderId)
      .maybeSingle();

    console.log("PEDIDO EXISTE:", existe.data);

    if (existe.data) {
      console.log("PEDIDO DUPLICADO");

      return NextResponse.json({
        success: true,
        duplicated: true,
      });
    }

    const token = uuidv4();

    console.log("TOKEN GERADO:", token);

    const { data, error } = await supabaseAdmin
      .from("magazine_orders")
      .insert({
        order_id: orderId,
        product_id: productId,
        nome,
        email,
        telefone,
        plano: produto,
        token,
        status: "novo",
      })
      .select();

    console.log("====================================");
    console.log("RESULTADO INSERT:");
    console.log(data);

    console.log("ERRO INSERT:");
    console.log(error);
    console.log("====================================");

    if (error) {
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
      `https://www.monatiza.com/editorial/revista/formulario/${token}`;

    const htmlEmail = `
      <div style="font-family: Arial; padding: 30px;">
        <h2>Olá ${nome}</h2>

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

        <p>
          Caso o botão não funcione:
        </p>

        <p>
          ${formularioUrl}
        </p>

        <br />

        <p>
          Equipe Empreende Brazil
        </p>
      </div>
    `;

    try {
      console.log("====================================");
      console.log("ENVIANDO EMAIL...");
      console.log("EMAIL DESTINO:", email);

      const resultadoEmail = await resend.emails.send({
        from: "Revista Empreende Brazil <revista@monatiza.com>",
        to: email,
        subject: "Preencha seu formulário da Revista Empreende Brazil",
        html: htmlEmail,
      });

      console.log("RESULTADO EMAIL:");
      console.log(JSON.stringify(resultadoEmail, null, 2));

      console.log("EMAIL ENVIADO COM SUCESSO");
      console.log("====================================");
    } catch (emailError: any) {
      console.log("====================================");
      console.error("ERRO EMAIL COMPLETO:");
      console.error(JSON.stringify(emailError, null, 2));
      console.log("====================================");
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.log("====================================");
    console.error("ERRO GERAL WEBHOOK:");
    console.error(error);
    console.error(error?.message);
    console.log("====================================");

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