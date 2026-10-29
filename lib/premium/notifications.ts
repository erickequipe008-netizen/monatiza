import { supabase } from "@/lib/supabase/client";
import type { CommunityProfile } from "@/lib/premium/community";

export interface AppNotification {
  id: number;
  actor_id: string | null;
  type: "like" | "comment" | "follow" | "message" | "repost" | string;
  post_id: number | null;
  read: boolean;
  created_at: string;
  actor?: CommunityProfile;
  postImage?: string | null;
  postText?: string | null;
}

async function uid(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user.id ?? null;
}

export async function listNotifications(): Promise<AppNotification[]> {
  // RLS já limita às notificações do próprio usuário. Só atividade de POSTS (nada de mensagens).
  const { data } = await supabase
    .from("notifications")
    .select("id, actor_id, type, post_id, read, created_at")
    .neq("type", "message")
    .order("created_at", { ascending: false })
    .limit(60);
  const rows = (data || []) as AppNotification[];
  const actorIds = [...new Set(rows.map((r) => r.actor_id).filter(Boolean))] as string[];
  const postIds = [...new Set(rows.map((r) => r.post_id).filter(Boolean))] as number[];

  const [{ data: profs }, { data: posts }] = await Promise.all([
    actorIds.length
      ? supabase.from("community_profiles").select("user_id, handle, display_name, avatar_url, verified, verified_tier").in("user_id", actorIds)
      : Promise.resolve({ data: [] as any[] }),
    postIds.length
      ? supabase.from("posts").select("id, image_url, content").in("id", postIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);
  const pmap = new Map((profs || []).map((p: any) => [p.user_id, p]));
  const imgMap = new Map((posts || []).map((p: any) => [p.id, { image: p.image_url as string | null, text: p.content as string | null }]));
  return rows.map((r) => {
    const post = r.post_id ? imgMap.get(r.post_id) : undefined;
    return {
      ...r,
      actor: r.actor_id ? map(pmap, r.actor_id) : undefined,
      postImage: post?.image ?? null,
      postText: post?.text ?? null,
    };
  });
}

function map(m: Map<string, any>, id: string) {
  return m.get(id);
}

export async function countUnreadNotifications(): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .neq("type", "message")
    .eq("read", false);
  return count ?? 0;
}

export async function markNotificationsRead(): Promise<void> {
  const me = await uid();
  if (!me) return;
  await supabase.from("notifications").update({ read: true }).eq("user_id", me).eq("read", false);
}
