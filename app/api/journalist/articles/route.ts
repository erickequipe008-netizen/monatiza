import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function slugify(t: string) {
  const base = t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return `${base}-${Date.now().toString(36)}`;
}

// Envio de artigo BrandVoice pelo jornalista: consome 1 crédito e entra "em_analise".
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, string | undefined>;
    const { title, description, content, category, image_url } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "Título e conteúdo são obrigatórios." }, { status: 400 });
    }

    const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData.user) return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    const user = userData.user;

    // consome 1 crédito de forma atômica
    const { data: ok, error: rpcErr } = await supabaseAdmin.rpc("use_journalist_credit", {
      p_journalist: user.id,
    });
    if (rpcErr) return NextResponse.json({ error: rpcErr.message }, { status: 500 });
    if (!ok) {
      return NextResponse.json(
        { error: "Você não possui créditos disponíveis. Adquira um novo crédito para publicar um artigo." },
        { status: 402 }
      );
    }

    const meta = (user.user_metadata ?? {}) as { display_name?: string; name?: string };
    const journalistName = meta.display_name || meta.name || "Colunista";

    const { error: insErr } = await supabaseAdmin.from("articles").insert({
      title,
      description: description ?? null,
      content,
      category: category || "Negócios",
      image_url: image_url || null,
      slug: slugify(title),
      author: journalistName,
      journalist_name: journalistName,
      author_id: user.id,
      status: "em_analise",
      credit_used: true,
    });

    if (insErr) {
      // estorna o crédito se o artigo não foi salvo
      await supabaseAdmin.rpc("add_journalist_credits", { p_journalist: user.id, p_credits: 1 });
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao enviar a publicação";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
