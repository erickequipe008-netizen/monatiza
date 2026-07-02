import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Só admin (profiles.role = 'admin') acessa.
async function requireAdmin(req: Request) {
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  const { data: prof } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  return prof?.role === "admin" ? data.user : null;
}

export async function GET(req: Request) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const [subs, members, posts, reels, pending] = await Promise.all([
    supabaseAdmin.from("subscribers").select("status"),
    supabaseAdmin.from("community_profiles").select("user_id", { count: "exact", head: true }),
    supabaseAdmin.from("posts").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("reels").select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("verification_requests")
      .select("user_id", { count: "exact", head: true })
      .in("status", ["paid", "review"]),
  ]);

  const subsRows = (subs.data || []) as { status: string }[];
  const stats = {
    activeSubscribers: subsRows.filter((s) => s.status === "active").length,
    totalSubscribers: subsRows.length,
    members: members.count ?? 0,
    posts: posts.count ?? 0,
    reels: reels.count ?? 0,
    pending: pending.count ?? 0,
  };

  const { data: reqs } = await supabaseAdmin
    .from("verification_requests")
    .select("user_id, doc_url, selfie_url, status, created_at")
    .in("status", ["paid", "review"])
    .order("created_at", { ascending: true });

  const requests = [];
  for (const r of reqs || []) {
    const { data: prof } = await supabaseAdmin
      .from("community_profiles")
      .select("handle, display_name, avatar_url")
      .eq("user_id", r.user_id)
      .maybeSingle();
    const docUrl = r.doc_url
      ? (await supabaseAdmin.storage.from("verification").createSignedUrl(r.doc_url, 300)).data?.signedUrl ?? null
      : null;
    const selfieUrl = r.selfie_url
      ? (await supabaseAdmin.storage.from("verification").createSignedUrl(r.selfie_url, 300)).data?.signedUrl ?? null
      : null;
    requests.push({ user_id: r.user_id, status: r.status, created_at: r.created_at, profile: prof, docUrl, selfieUrl });
  }

  return NextResponse.json({ stats, requests });
}

export async function POST(req: Request) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const body = (await req.json()) as { user_id?: string; handle?: string; action?: string; tier?: string };
  const tier = body.tier === "silver" ? "silver" : "gold";

  // Verificação MANUAL por @ (libera o selo para qualquer pessoa, sem o fluxo pago)
  if (body.handle && (body.action === "grant" || body.action === "revoke")) {
    const verified = body.action === "grant";
    const handle = body.handle.trim().replace(/^@/, "");
    const { data: prof } = await supabaseAdmin
      .from("community_profiles")
      .select("user_id, display_name, handle")
      .ilike("handle", handle)
      .maybeSingle();
    if (!prof) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    await supabaseAdmin
      .from("community_profiles")
      .update({ verified, verified_tier: verified ? tier : null })
      .eq("user_id", prof.user_id);
    return NextResponse.json({ ok: true, name: prof.display_name || prof.handle });
  }

  // Aprovar/rejeitar um pedido (fluxo pago)
  if (body.user_id && (body.action === "approve" || body.action === "reject")) {
    const verified = body.action === "approve";
    await supabaseAdmin
      .from("community_profiles")
      .update({ verified, verified_tier: verified ? tier : null })
      .eq("user_id", body.user_id);
    await supabaseAdmin
      .from("verification_requests")
      .update({ status: verified ? "approved" : "rejected", updated_at: new Date().toISOString() })
      .eq("user_id", body.user_id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
}
