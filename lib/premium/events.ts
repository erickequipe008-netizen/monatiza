import { supabase } from "@/lib/supabase/client";

// Rastreio leve das ações do usuário para aprender o que ele gosta e personalizar o Explorar.
export type EventKind =
  | "like_post"
  | "open_article"
  | "click_tag"
  | "follow"
  | "not_interested"
  | "view_post";

export function extractTags(text?: string | null): string[] {
  if (!text) return [];
  const found = (text.match(/#[\p{L}0-9_]+/gu) || []).map((t) => t.toLowerCase());
  return [...new Set(found)].slice(0, 6);
}

// Grava o evento (fire-and-forget; nunca quebra a UI).
export async function logEvent(
  kind: EventKind,
  opts: {
    tags?: string[];
    text?: string | null;
    category?: string | null;
    targetUser?: string | null;
    weight?: number;
  } = {}
): Promise<void> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const u = session?.user?.id;
    if (!u) return;
    const tags = opts.tags ?? extractTags(opts.text);
    type Row = {
      user_id: string;
      kind: EventKind;
      category: string | null;
      target_user: string | null;
      weight: number;
      tag: string | null;
    };
    const base = { user_id: u, kind, category: opts.category ?? null, target_user: opts.targetUser ?? null, weight: opts.weight ?? 1 };
    const rows: Row[] = tags.length ? tags.map((tag) => ({ ...base, tag })) : [{ ...base, tag: null }];
    await supabase.from("user_events").insert(rows);
  } catch {
    /* silencioso */
  }
}

export interface Interests {
  tags: string[];
  categories: string[];
  tagSet: Set<string>;
  catSet: Set<string>;
  authors: Set<string>;
}

const EMPTY: Interests = { tags: [], categories: [], tagSet: new Set(), catSet: new Set(), authors: new Set() };

// Deriva os interesses a partir dos eventos recentes (mais uso → melhor recomendação).
export async function getMyInterests(): Promise<Interests> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const u = session?.user?.id;
    if (!u) return EMPTY;
    const { data } = await supabase
      .from("user_events")
      .select("kind, tag, category, target_user, weight")
      .eq("user_id", u)
      .order("created_at", { ascending: false })
      .limit(500);
    const tagW = new Map<string, number>();
    const catW = new Map<string, number>();
    const authors = new Set<string>();
    (data || []).forEach((e: any) => {
      const sign = e.kind === "not_interested" ? -1.5 : 1;
      const w = sign * (e.weight || 1);
      if (e.tag) tagW.set(e.tag, (tagW.get(e.tag) || 0) + w);
      if (e.category) catW.set(e.category, (catW.get(e.category) || 0) + w);
      if (e.kind === "follow" && e.target_user) authors.add(e.target_user);
    });
    const top = (m: Map<string, number>, n: number) =>
      [...m.entries()].filter(([, w]) => w > 0).sort((a, b) => b[1] - a[1]).map(([k]) => k).slice(0, n);
    const tags = top(tagW, 14);
    const categories = top(catW, 8);
    return { tags, categories, tagSet: new Set(tags), catSet: new Set(categories), authors };
  } catch {
    return EMPTY;
  }
}
