import { supabase } from "@/lib/supabase/client";
import type { ArticleCard } from "@/lib/premium/articles";

// Colunas de card embutidas via relação article_id → articles(id).
const CARD = "id, slug, title, excerpt, image_url, category, created_at, is_premium";

// Helpers da biblioteca pessoal do assinante (favoritos, curtidas, histórico).
// Todas as tabelas têm RLS "dono lê/escreve só o seu" → basta passar o user_id.

async function currentUid(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user.id ?? null;
}

// ── Favoritos (bookmarks) ──────────────────────────────────
export async function isBookmarked(articleId: number): Promise<boolean> {
  const uid = await currentUid();
  if (!uid) return false;
  const { count } = await supabase
    .from("bookmarks")
    .select("article_id", { count: "exact", head: true })
    .eq("user_id", uid)
    .eq("article_id", articleId);
  return (count ?? 0) > 0;
}

export async function toggleBookmark(articleId: number, on: boolean): Promise<void> {
  const uid = await currentUid();
  if (!uid) return;
  if (on) {
    await supabase.from("bookmarks").upsert(
      { user_id: uid, article_id: articleId },
      { onConflict: "user_id,article_id" }
    );
  } else {
    await supabase.from("bookmarks").delete().eq("user_id", uid).eq("article_id", articleId);
  }
}

// ── Curtidas (article_likes) ───────────────────────────────
export async function isLiked(articleId: number): Promise<boolean> {
  const uid = await currentUid();
  if (!uid) return false;
  const { count } = await supabase
    .from("article_likes")
    .select("article_id", { count: "exact", head: true })
    .eq("user_id", uid)
    .eq("article_id", articleId);
  return (count ?? 0) > 0;
}

export async function toggleLike(articleId: number, on: boolean): Promise<void> {
  const uid = await currentUid();
  if (!uid) return;
  if (on) {
    await supabase.from("article_likes").upsert(
      { user_id: uid, article_id: articleId },
      { onConflict: "user_id,article_id" }
    );
  } else {
    await supabase.from("article_likes").delete().eq("user_id", uid).eq("article_id", articleId);
  }
}

// ── Histórico de leitura ───────────────────────────────────
// Garante a linha e marca o último acesso (sem zerar o tempo já acumulado).
export async function recordView(articleId: number): Promise<void> {
  const uid = await currentUid();
  if (!uid) return;
  const { data } = await supabase
    .from("reading_history")
    .select("read_seconds, progress")
    .eq("user_id", uid)
    .eq("article_id", articleId)
    .maybeSingle();
  await supabase.from("reading_history").upsert(
    {
      user_id: uid,
      article_id: articleId,
      last_read_at: new Date().toISOString(),
      read_seconds: data?.read_seconds ?? 0,
      progress: data?.progress ?? 0,
    },
    { onConflict: "user_id,article_id" }
  );
}

// Acumula tempo de leitura e guarda o maior progresso atingido (0..1).
export async function addReadingTime(articleId: number, seconds: number, progress = 0): Promise<void> {
  const uid = await currentUid();
  if (!uid || seconds <= 0) return;
  const { data } = await supabase
    .from("reading_history")
    .select("read_seconds, progress")
    .eq("user_id", uid)
    .eq("article_id", articleId)
    .maybeSingle();
  await supabase.from("reading_history").upsert(
    {
      user_id: uid,
      article_id: articleId,
      last_read_at: new Date().toISOString(),
      read_seconds: (data?.read_seconds ?? 0) + Math.round(seconds),
      progress: Math.max(data?.progress ?? 0, Math.min(1, progress)),
    },
    { onConflict: "user_id,article_id" }
  );
}

// ── Coleções (para a Biblioteca) ───────────────────────────
export interface HistoryCard extends ArticleCard {
  progress?: number;
  last_read_at?: string;
}

export async function getSaved(): Promise<ArticleCard[]> {
  const uid = await currentUid();
  if (!uid) return [];
  const { data } = await supabase
    .from("bookmarks")
    .select(`created_at, articles(${CARD})`)
    .eq("user_id", uid)
    .order("created_at", { ascending: false });
  return (data || []).map((r: any) => r.articles).filter(Boolean) as ArticleCard[];
}

export async function getLiked(): Promise<ArticleCard[]> {
  const uid = await currentUid();
  if (!uid) return [];
  const { data } = await supabase
    .from("article_likes")
    .select(`created_at, articles(${CARD})`)
    .eq("user_id", uid)
    .order("created_at", { ascending: false });
  return (data || []).map((r: any) => r.articles).filter(Boolean) as ArticleCard[];
}

export async function getHistory(limit = 50): Promise<HistoryCard[]> {
  const uid = await currentUid();
  if (!uid) return [];
  const { data } = await supabase
    .from("reading_history")
    .select(`last_read_at, progress, articles(${CARD})`)
    .eq("user_id", uid)
    .order("last_read_at", { ascending: false })
    .limit(limit);
  return (data || [])
    .map((r: any) => (r.articles ? { ...r.articles, progress: r.progress, last_read_at: r.last_read_at } : null))
    .filter(Boolean) as HistoryCard[];
}

// "Continuar lendo": começou mas não terminou.
export async function getContinueReading(limit = 8): Promise<HistoryCard[]> {
  const all = await getHistory(40);
  return all.filter((a) => (a.progress ?? 0) > 0.02 && (a.progress ?? 0) < 0.92).slice(0, limit);
}

// ── Estatísticas (Dashboard) ───────────────────────────────
export interface DashboardStats {
  articlesRead: number;
  readingMinutes: number;
  saved: number;
  liked: number;
  daysSubscribed: number;
  topCategories: { category: string; count: number }[];
}

export async function getStats(): Promise<DashboardStats> {
  const empty: DashboardStats = {
    articlesRead: 0,
    readingMinutes: 0,
    saved: 0,
    liked: 0,
    daysSubscribed: 0,
    topCategories: [],
  };
  const uid = await currentUid();
  if (!uid) return empty;

  const [rhRes, savedRes, likedRes, subRes] = await Promise.all([
    supabase.from("reading_history").select(`read_seconds, articles(category)`).eq("user_id", uid),
    supabase.from("bookmarks").select("article_id", { count: "exact", head: true }).eq("user_id", uid),
    supabase.from("article_likes").select("article_id", { count: "exact", head: true }).eq("user_id", uid),
    supabase.from("subscribers").select("created_at").eq("id", uid).maybeSingle(),
  ]);

  const rows = (rhRes.data || []) as any[];
  const totalSec = rows.reduce((s, r) => s + (r.read_seconds || 0), 0);

  const catCount: Record<string, number> = {};
  rows.forEach((r) => {
    const c = r.articles?.category;
    if (c) catCount[c] = (catCount[c] || 0) + 1;
  });
  const topCategories = Object.entries(catCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const created = subRes.data?.created_at as string | undefined;
  const daysSubscribed = created
    ? Math.max(1, Math.floor((Date.now() - new Date(created).getTime()) / 86_400_000))
    : 0;

  return {
    articlesRead: rows.length,
    readingMinutes: Math.round(totalSec / 60),
    saved: savedRes.count ?? 0,
    liked: likedRes.count ?? 0,
    daysSubscribed,
    topCategories,
  };
}
