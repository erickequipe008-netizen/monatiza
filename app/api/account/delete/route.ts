import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Exclui a conta do próprio usuário (verifica o token) e limpa os dados.
export async function POST(req: Request) {
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
  const uid = data.user.id;

  // Conteúdo sem cascade automático (posts.user_id não tem FK).
  for (const table of ["posts", "reels"]) {
    try {
      await supabaseAdmin.from(table).delete().eq("user_id", uid);
    } catch {
      /* segue */
    }
  }

  // Apaga o usuário — cascade: community_profiles, follows, direct_messages,
  // notifications, user_events, subscribers, etc.
  const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(uid);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
