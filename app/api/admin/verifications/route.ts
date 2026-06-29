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

  const { user_id, action } = (await req.json()) as { user_id?: string; action?: string };
  if (!user_id || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const verified = action === "approve";
  await supabaseAdmin.from("community_profiles").update({ verified }).eq("user_id", user_id);
  await supabaseAdmin
    .from("verification_requests")
    .update({ status: verified ? "approved" : "rejected", updated_at: new Date().toISOString() })
    .eq("user_id", user_id);

  return NextResponse.json({ ok: true });
}
