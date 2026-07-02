import { supabase } from "@/lib/supabase/client";
import type { CommunityProfile } from "@/lib/premium/community";

// ─────────────────────────────────────────────────────────────
// Stories: mídia que expira em 24h. Visualização registra "quem viu".
// ─────────────────────────────────────────────────────────────

export interface Story {
  id: number;
  user_id: string;
  media_url: string | null;
  media_type: "image" | "video" | "text" | string;
  text_content?: string | null;
  bg?: string | null;
  created_at: string;
  expires_at: string;
  viewedByMe?: boolean;
}

// Fundos disponíveis para story de texto.
export const STORY_BGS: { key: string; css: string }[] = [
  { key: "brand", css: "linear-gradient(135deg,#4285F4,#9B72CB,#FF5C8A)" },
  { key: "noite", css: "linear-gradient(135deg,#141E30,#243B55)" },
  { key: "fogo", css: "linear-gradient(135deg,#f12711,#f5af19)" },
  { key: "verde", css: "linear-gradient(135deg,#11998e,#38ef7d)" },
  { key: "rosa", css: "linear-gradient(135deg,#7C3AED,#FF2D87)" },
];

export function storyBgCss(key?: string | null): string {
  return (STORY_BGS.find((b) => b.key === key) || STORY_BGS[0]).css;
}

export interface StoryGroup {
  user: CommunityProfile;
  stories: Story[];
  allViewed: boolean;
  isMine: boolean;
}

async function uid(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user.id ?? null;
}

// Stories ativos agrupados por autor (os meus primeiro).
export async function listStoryGroups(): Promise<StoryGroup[]> {
  const me = await uid();
  const { data } = await supabase
    .from("stories")
    .select("id, user_id, media_url, media_type, text_content, bg, created_at, expires_at")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(200);
  const rows = (data || []) as Story[];
  if (!rows.length) return [];

  const ids = rows.map((s) => s.id);
  const { data: views } = await supabase.from("story_views").select("story_id").in("story_id", ids);
  const viewed = new Set((views || []).map((v: any) => v.story_id));

  const authorIds = [...new Set(rows.map((s) => s.user_id))];
  const { data: profs } = await supabase
    .from("community_profiles")
    .select("user_id, handle, display_name, avatar_url, verified")
    .in("user_id", authorIds);
  const pmap = new Map((profs || []).map((p: any) => [p.user_id, p]));

  const groups = new Map<string, StoryGroup>();
  rows.forEach((s) => {
    s.viewedByMe = viewed.has(s.id);
    const g = groups.get(s.user_id);
    if (g) {
      g.stories.push(s);
    } else {
      const user = pmap.get(s.user_id);
      if (user) groups.set(s.user_id, { user, stories: [s], allViewed: true, isMine: s.user_id === me });
    }
  });

  const list = [...groups.values()].map((g) => ({ ...g, allViewed: g.stories.every((s) => s.viewedByMe) }));
  // meus primeiro, depois não vistos, depois o resto
  return list.sort((a, b) => Number(b.isMine) - Number(a.isMine) || Number(a.allViewed) - Number(b.allViewed));
}

export async function createStory(mediaUrl: string, mediaType: "image" | "video"): Promise<boolean> {
  const me = await uid();
  if (!me) return false;
  const { error } = await supabase.from("stories").insert({ user_id: me, media_url: mediaUrl, media_type: mediaType });
  return !error;
}

// Story de texto (frase + fundo em gradiente).
export async function createTextStory(text: string, bg: string): Promise<boolean> {
  const me = await uid();
  const t = text.trim().slice(0, 280);
  if (!me || !t) return false;
  const { error } = await supabase
    .from("stories")
    .insert({ user_id: me, media_url: null, media_type: "text", text_content: t, bg });
  return !error;
}

export async function markStoryViewed(storyId: number): Promise<void> {
  const me = await uid();
  if (!me) return;
  await supabase.from("story_views").upsert({ story_id: storyId, viewer_id: me }, { onConflict: "story_id,viewer_id" });
}

// Só funciona para o dono do story (RLS).
export async function listStoryViewers(storyId: number): Promise<CommunityProfile[]> {
  const { data } = await supabase.from("story_views").select("viewer_id").eq("story_id", storyId);
  const ids = (data || []).map((v: any) => v.viewer_id);
  if (!ids.length) return [];
  const { data: profs } = await supabase
    .from("community_profiles")
    .select("user_id, handle, display_name, avatar_url, verified")
    .in("user_id", ids);
  return (profs as CommunityProfile[]) || [];
}

export async function deleteStory(storyId: number): Promise<void> {
  await supabase.from("stories").delete().eq("id", storyId);
}
