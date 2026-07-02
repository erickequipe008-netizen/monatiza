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
}

async function uid(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user.id ?? null;
}

export async function listNotifications(): Promise<AppNotification[]> {
  // RLS já limita às notificações do próprio usuário.
  const { data } = await supabase
    .from("notifications")
    .select("id, actor_id, type, post_id, read, created_at")
    .order("created_at", { ascending: false })
    .limit(60);
  const rows = (data || []) as AppNotification[];
  const actorIds = [...new Set(rows.map((r) => r.actor_id).filter(Boolean))] as string[];
  if (!actorIds.length) return rows;
  const { data: profs } = await supabase
    .from("community_profiles")
    .select("user_id, handle, display_name, avatar_url, verified")
    .in("user_id", actorIds);
  const map = new Map((profs || []).map((p: any) => [p.user_id, p]));
  return rows.map((r) => ({ ...r, actor: r.actor_id ? map.get(r.actor_id) : undefined }));
}

export async function countUnreadNotifications(): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("read", false);
  return count ?? 0;
}

export async function markNotificationsRead(): Promise<void> {
  const me = await uid();
  if (!me) return;
  await supabase.from("notifications").update({ read: true }).eq("user_id", me).eq("read", false);
}
