import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { data: order, error: orderError } =
      await supabaseAdmin
        .from("magazine_orders")
        .select("*")
        .eq("token", body.token)
        .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          success: false,
          error: "Pedido não encontrado",
        },
        {
          status: 404,
        }
      );
    }

    const { error } = await supabaseAdmin
      .from("magazine_forms")
      .insert({
        order_id: order.id,
        nome_empresa: body.nome_empresa,
        cargo: body.cargo,
        biografia: body.biografia,
        instagram: body.instagram,
        linkedin: body.linkedin,
        whatsapp: body.whatsapp,
        site: body.site,
        tema_materia: body.tema_materia,
        observacoes: body.observacoes,
      });

    if (error) {
      console.error(error);

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

    await supabaseAdmin
      .from("magazine_orders")
      .update({
        status: "formulario_enviado",
      })
      .eq("id", order.id);

    return NextResponse.json({
      success: true,
    });

  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}