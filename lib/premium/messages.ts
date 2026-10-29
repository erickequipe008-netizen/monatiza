import { supabase } from "@/lib/supabase/client";
import type { CommunityProfile } from "@/lib/premium/community";

// ─────────────────────────────────────────────────────────────
// Mensagens diretas (DM) entre assinantes.
// RLS: só leio/escrevo conversas em que sou remetente ou destinatário.
// ─────────────────────────────────────────────────────────────

export interface DirectMessage {
  id: number;
  sender_id: string;
  recipient_id: string;
  content: string;
  image_url?: string | null;
  read?: boolean;
  created_at: string;
}

export interface Conversation {
  other: string;
  content: string;
  created_at: string;
  fromMe: boolean;
  profile?: CommunityProfile;
  unread?: number;
}

async function uid(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user.id ?? null;
}

// ── Não lidas: baseado no status "read" do banco (sincroniza entre aparelhos) ──
export async function countUnread(): Promise<number> {
  const me = await uid();
  if (!me) return 0;
  const { count } = await supabase
    .from("direct_messages")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", me)
    .eq("read", false);
  return count ?? 0;
}

// Marca como lidas todas as mensagens recebidas nesta conversa.
export async function markConversationRead(otherId: string): Promise<void> {
  const me = await uid();
  if (!me) return;
  await supabase
    .from("direct_messages")
    .update({ read: true })
    .eq("recipient_id", me)
    .eq("sender_id", otherId)
    .eq("read", false);
}

export async function listConversations(): Promise<Conversation[]> {
  const me = await uid();
  if (!me) return [];
  const { data } = await supabase
    .from("direct_messages")
    .select("sender_id, recipient_id, content, image_url, read, created_at")
    .or(`sender_id.eq.${me},recipient_id.eq.${me}`)
    .order("created_at", { ascending: false })
    .limit(300);

  const latest = new Map<string, Conversation>();
  const unread: Record<string, number> = {};
  (data || []).forEach((r: any) => {
    const other = r.sender_id === me ? r.recipient_id : r.sender_id;
    if (!latest.has(other))
      latest.set(other, {
        other,
        content: r.content || (r.image_url ? "📷 Foto" : ""),
        created_at: r.created_at,
        fromMe: r.sender_id === me,
      });
    if (r.recipient_id === me && r.read === false) unread[other] = (unread[other] || 0) + 1;
  });
  const ids = [...latest.keys()];
  if (!ids.length) return [];

  const { data: profs } = await supabase
    .from("community_profiles")
    .select("user_id, handle, display_name, avatar_url, verified")
    .in("user_id", ids);
  const pmap = new Map((profs || []).map((p: any) => [p.user_id, p]));
  return [...latest.values()].map((c) => ({ ...c, profile: pmap.get(c.other), unread: unread[c.other] || 0 }));
}

export async function fetchMessages(otherId: string): Promise<DirectMessage[]> {
  const me = await uid();
  if (!me) return [];
  const { data } = await supabase
    .from("direct_messages")
    .select("id, sender_id, recipient_id, content, image_url, read, created_at")
    .or(
      `and(sender_id.eq.${me},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${me})`
    )
    .order("created_at", { ascending: true })
    .limit(300);
  return (data as DirectMessage[]) || [];
}

export async function sendMessage(
  otherId: string,
  content: string,
  imageUrl: string | null = null
): Promise<DirectMessage | null> {
  const me = await uid();
  const text = content.trim();
  if (!me || (!text && !imageUrl)) return null;
  const { data } = await supabase
    .from("direct_messages")
    .insert({ sender_id: me, recipient_id: otherId, content: text.slice(0, 2000), image_url: imageUrl })
    .select("id, sender_id, recipient_id, content, image_url, read, created_at")
    .maybeSingle();
  return (data as DirectMessage) || null;
}

export async function getProfileById(userId: string): Promise<CommunityProfile | null> {
  const { data } = await supabase
    .from("community_profiles")
    .select("user_id, handle, display_name, avatar_url, bio, verified")
    .eq("user_id", userId)
    .maybeSingle();
  return (data as CommunityProfile) || null;
}
