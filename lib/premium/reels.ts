import { supabase } from "@/lib/supabase/client";
import type { CommunityProfile } from "@/lib/premium/community";

export interface Reel {
  id: number;
  user_id: string;
  video_url: string;
  caption: string | null;
  created_at: string;
  author?: CommunityProfile;
  likeCount: number;
  likedByMe: boolean;
}

async function uid(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user.id ?? null;
}

async function enrich(rows: any[]): Promise<Reel[]> {
  if (!rows.length) return [];
  const me = await uid();
  const ids = rows.map((r) => r.id);
  const authorIds = [...new Set(rows.map((r) => r.user_id))];

  const [{ data: profs }, { data: likes }] = await Promise.all([
    supabase
      .from("community_profiles")
      .select("user_id, handle, display_name, avatar_url, verified")
      .in("user_id", authorIds),
    supabase.from("reel_likes").select("reel_id, user_id").in("reel_id", ids),
  ]);

  const pmap = new Map((profs || []).map((p: any) => [p.user_id, p]));
  const likeCount: Record<number, number> = {};
  const liked: Record<number, boolean> = {};
  (likes || []).forEach((l: any) => {
    likeCount[l.reel_id] = (likeCount[l.reel_id] || 0) + 1;
    if (l.user_id === me) liked[l.reel_id] = true;
  });

  return rows.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    video_url: r.video_url,
    caption: r.caption,
    created_at: r.created_at,
    author: pmap.get(r.user_id),
    likeCount: likeCount[r.id] || 0,
    likedByMe: !!liked[r.id],
  }));
}

const COLS = "id, user_id, video_url, caption, created_at";

export async function listReels(limit = 20, before?: string | null): Promise<Reel[]> {
  let q = supabase.from("reels").select(COLS).order("created_at", { ascending: false }).limit(limit);
  if (before) q = q.lt("created_at", before);
  const { data } = await q;
  return enrich(data || []);
}

export async function createReel(videoUrl: string, caption: string): Promise<Reel | null> {
  const u = await uid();
  if (!u || !videoUrl) return null;
  const { data } = await supabase
    .from("reels")
    .insert({ user_id: u, video_url: videoUrl, caption: caption.trim().slice(0, 300) || null })
    .select(COLS)
    .maybeSingle();
  if (!data) return null;
  const [r] = await enrich([data]);
  return r;
}

export async function deleteReel(id: number): Promise<void> {
  const u = await uid();
  if (!u) return;
  await supabase.from("reels").delete().eq("id", id).eq("user_id", u);
}

export async function toggleReelLike(reelId: number, on: boolean): Promise<void> {
  const u = await uid();
  if (!u) return;
  if (on) {
    await supabase.from("reel_likes").upsert({ reel_id: reelId, user_id: u }, { onConflict: "reel_id,user_id" });
  } else {
    await supabase.from("reel_likes").delete().eq("reel_id", reelId).eq("user_id", u);
  }
}
