import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("WEBHOOK RECEBIDO:", body);

    // Dados vindos da Kiwify
    const produto =
      body.product_name ||
      body.Product?.name ||
      body.product?.name ||
      "";

    const orderId =
      body.order_id ||
      body.order?.order_id ||
      body.order?.order_ref;

    const nome =
      body.customer_name ||
      body.Customer?.full_name ||
      body.customer?.name;

    const email =
      body.customer_email ||
      body.Customer?.email ||
      body.customer?.email;

    const telefone =
      body.customer_phone ||
      body.Customer?.mobile ||
      body.customer?.phone;


    console.log("PRODUTO:", produto);
    console.log("EMAIL CLIENTE:", email);


    // Só dispara para Revista
    if (produto !== "Revista Empreende Brazil") {
      return NextResponse.json({
        success: true,
        ignored: true,
      });
    }


    // evita duplicar pedido
    const existe = await supabaseAdmin
      .from("magazine_orders")
      .select("id")
      .eq("order_id", orderId)
      .maybeSingle();


    if (existe.data) {
      console.log("PEDIDO DUPLICADO");

      return NextResponse.json({
        success: true,
        duplicated: true,
      });
    }


    const token = uuidv4();


    // salva pedido
    const { data, error } = await supabaseAdmin
      .from("magazine_orders")
      .insert({
        order_id: orderId,
        product_id: body.product_id,

        nome,
        email,
        telefone,

        plano: produto,
        token,

        status: "novo",
      })
      .select();


    if (error) {
      console.error("ERRO SUPABASE:", error);

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


    console.log("PEDIDO SALVO:", data);


    const formularioUrl =
      `https://www.monatiza.com/editorial/revista/formulario/${token}`;


    // ENVIO EMAIL RESEND
    const emailResult = await resend.emails.send({

      from:
        "Revista Empreende Brazil <revista@monatiza.com>",

      to: email,

      subject:
        "Preencha seu formulário da Revista Empreende Brazil",

      html: `
        <div style="
          font-family: Arial;
          padding:30px;
        ">

          <h2>
            Olá ${nome}
          </h2>

          <p>
            Recebemos sua inscrição na 
            Revista Empreende Brazil.
          </p>

          <p>
            Para iniciarmos a produção 
            da sua matéria, preencha 
            o formulário abaixo:
          </p>


          <p style="margin-top:30px">

            <a href="${formularioUrl}"

            style="
            background:#000;
            color:white;
            padding:15px 25px;
            border-radius:8px;
            text-decoration:none;
            display:inline-block;
            ">

            Preencher Formulário

            </a>

          </p>


          <br/>

          <p>
            Equipe Empreende Brazil
          </p>

        </div>
      `,
    });


    console.log(
      "RESULTADO EMAIL:",
      emailResult
    );


    if (emailResult.error) {

      console.error(
        "ERRO RESEND:",
        emailResult.error
      );

      return NextResponse.json({
        success: true,
        saved: true,
        email: false,
        resend_error:
          emailResult.error,
      });
    }



    return NextResponse.json({

      success: true,

      saved: true,

      email: true,

      data,

    });



  } catch (error: any) {

    console.error(
      "ERRO WEBHOOK:",
      error
    );


    return NextResponse.json(
      {
        success:false,
        error:error?.message,
      },
      {
        status:500,
      }
    );

  }
}