import { supabase } from "@/lib/supabase/client";

// ─────────────────────────────────────────────────────────────
// Rede social do assinante: perfis + posts (feed de opinião).
// Todas as leituras/escritas passam pelo RLS (só assinante ativo).
// ─────────────────────────────────────────────────────────────

export interface CommunityProfile {
  user_id: string;
  handle: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url?: string | null;
  created_at?: string;
}

export interface Post {
  id: number;
  user_id: string;
  content: string;
  image_url: string | null;
  parent_id: number | null;
  created_at: string;
  author?: CommunityProfile;
  likeCount: number;
  likedByMe: boolean;
  replyCount: number;
}

async function uid(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user.id ?? null;
}

function handleFromEmail(email: string) {
  return (
    email.split("@")[0].replace(/[^a-z0-9_]/gi, "").toLowerCase().slice(0, 20) || "membro"
  );
}

// Cria o perfil social no primeiro acesso (idempotente).
export async function ensureProfile(): Promise<CommunityProfile | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const u = session?.user;
  if (!u) return null;

  const { data: existing } = await supabase
    .from("community_profiles")
    .select("*")
    .eq("user_id", u.id)
    .maybeSingle();
  if (existing) return existing as CommunityProfile;

  const base = handleFromEmail(u.email || "membro");
  let handle = base;
  for (let i = 0; i < 6; i++) {
    const { count } = await supabase
      .from("community_profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("handle", handle);
    if (!count) break;
    handle = `${base}${Math.floor(Math.random() * 9000 + 1000)}`;
  }
  const display_name = (u.user_metadata?.name as string | undefined) || base;
  const { data } = await supabase
    .from("community_profiles")
    .insert({ user_id: u.id, handle, display_name })
    .select()
    .maybeSingle();
  return (data as CommunityProfile) || null;
}

export async function getMyProfile(): Promise<CommunityProfile | null> {
  const u = await uid();
  if (!u) return null;
  const { data } = await supabase.from("community_profiles").select("*").eq("user_id", u).maybeSingle();
  return (data as CommunityProfile) || null;
}

export async function getProfileByHandle(handle: string): Promise<CommunityProfile | null> {
  const { data } = await supabase
    .from("community_profiles")
    .select("*")
    .eq("handle", handle)
    .maybeSingle();
  return (data as CommunityProfile) || null;
}

export async function updateProfile(
  p: Partial<CommunityProfile>
): Promise<{ error: string | null }> {
  const u = await uid();
  if (!u) return { error: "Não autenticado" };
  const { error } = await supabase
    .from("community_profiles")
    .update({
      display_name: p.display_name,
      bio: p.bio,
      avatar_url: p.avatar_url,
      cover_url: p.cover_url,
      handle: p.handle,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", u);
  if (error) {
    if (error.code === "23505") return { error: "Esse @usuário já está em uso." };
    return { error: error.message };
  }
  return { error: null };
}

// Junta autor + contagem de curtidas/respostas aos posts.
async function enrich(rows: any[]): Promise<Post[]> {
  if (!rows.length) return [];
  const me = await uid();
  const ids = rows.map((r) => r.id);
  const authorIds = [...new Set(rows.map((r) => r.user_id))];

  const [{ data: profs }, { data: likes }, { data: replies }] = await Promise.all([
    supabase
      .from("community_profiles")
      .select("user_id, handle, display_name, avatar_url")
      .in("user_id", authorIds),
    supabase.from("post_likes").select("post_id, user_id").in("post_id", ids),
    supabase.from("posts").select("parent_id").in("parent_id", ids),
  ]);

  const pmap = new Map((profs || []).map((p: any) => [p.user_id, p]));
  const likeCount: Record<number, number> = {};
  const liked: Record<number, boolean> = {};
  (likes || []).forEach((l: any) => {
    likeCount[l.post_id] = (likeCount[l.post_id] || 0) + 1;
    if (l.user_id === me) liked[l.post_id] = true;
  });
  const replyCount: Record<number, number> = {};
  (replies || []).forEach((r: any) => {
    if (r.parent_id != null) replyCount[r.parent_id] = (replyCount[r.parent_id] || 0) + 1;
  });

  return rows.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    content: r.content,
    image_url: r.image_url ?? null,
    parent_id: r.parent_id,
    created_at: r.created_at,
    author: pmap.get(r.user_id),
    likeCount: likeCount[r.id] || 0,
    likedByMe: !!liked[r.id],
    replyCount: replyCount[r.id] || 0,
  }));
}

const POST_COLS = "id, user_id, content, image_url, parent_id, created_at";

export async function listPosts(limit = 30, before?: string | null): Promise<Post[]> {
  let q = supabase
    .from("posts")
    .select(POST_COLS)
    .is("parent_id", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (before) q = q.lt("created_at", before);
  const { data } = await q;
  return enrich(data || []);
}

export async function getPost(id: number): Promise<Post | null> {
  const { data } = await supabase.from("posts").select(POST_COLS).eq("id", id).maybeSingle();
  if (!data) return null;
  const [p] = await enrich([data]);
  return p;
}

export async function listReplies(parentId: number): Promise<Post[]> {
  const { data } = await supabase
    .from("posts")
    .select(POST_COLS)
    .eq("parent_id", parentId)
    .order("created_at", { ascending: true });
  return enrich(data || []);
}

export async function listUserPosts(userId: string, limit = 40): Promise<Post[]> {
  const { data } = await supabase
    .from("posts")
    .select(POST_COLS)
    .eq("user_id", userId)
    .is("parent_id", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  return enrich(data || []);
}

export async function createPost(
  content: string,
  parentId: number | null = null,
  imageUrl: string | null = null
): Promise<Post | null> {
  const u = await uid();
  if (!u) return null;
  const text = content.trim().slice(0, 1000);
  if (!text && !imageUrl) return null; // precisa de texto OU imagem
  const { data } = await supabase
    .from("posts")
    .insert({ user_id: u, content: text, parent_id: parentId, image_url: imageUrl })
    .select(POST_COLS)
    .maybeSingle();
  if (!data) return null;
  const [p] = await enrich([data]);
  return p;
}

export async function deletePost(id: number): Promise<void> {
  const u = await uid();
  if (!u) return;
  await supabase.from("posts").delete().eq("id", id).eq("user_id", u);
}

export async function togglePostLike(postId: number, on: boolean): Promise<void> {
  const u = await uid();
  if (!u) return;
  if (on) {
    await supabase.from("post_likes").upsert({ post_id: postId, user_id: u }, { onConflict: "post_id,user_id" });
  } else {
    await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", u);
  }
}

// ── Seguidores ─────────────────────────────────────────────
export interface FollowCounts {
  followers: number;
  following: number;
}

export async function getFollowCounts(userId: string): Promise<FollowCounts> {
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase.from("follows").select("follower_id", { count: "exact", head: true }).eq("following_id", userId),
    supabase.from("follows").select("following_id", { count: "exact", head: true }).eq("follower_id", userId),
  ]);
  return { followers: followers ?? 0, following: following ?? 0 };
}

export async function isFollowing(userId: string): Promise<boolean> {
  const me = await uid();
  if (!me) return false;
  const { count } = await supabase
    .from("follows")
    .select("following_id", { count: "exact", head: true })
    .eq("follower_id", me)
    .eq("following_id", userId);
  return (count ?? 0) > 0;
}

export async function follow(userId: string): Promise<void> {
  const me = await uid();
  if (!me || me === userId) return;
  await supabase.from("follows").upsert(
    { follower_id: me, following_id: userId },
    { onConflict: "follower_id,following_id" }
  );
}

export async function unfollow(userId: string): Promise<void> {
  const me = await uid();
  if (!me) return;
  await supabase.from("follows").delete().eq("follower_id", me).eq("following_id", userId);
}

async function profilesByIds(ids: string[]): Promise<CommunityProfile[]> {
  if (!ids.length) return [];
  const { data } = await supabase
    .from("community_profiles")
    .select("user_id, handle, display_name, avatar_url, bio")
    .in("user_id", ids);
  const map = new Map((data || []).map((p: any) => [p.user_id, p]));
  return ids.map((id) => map.get(id)).filter(Boolean) as CommunityProfile[];
}

export async function listFollowers(userId: string): Promise<CommunityProfile[]> {
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  return profilesByIds((data || []).map((r: any) => r.follower_id));
}

export async function listFollowing(userId: string): Promise<CommunityProfile[]> {
  const { data } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  return profilesByIds((data || []).map((r: any) => r.following_id));
}
