import type { SupabaseClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
// Estado de assinatura do usuário (lido no cliente).
// "isSubscriber" = assinante ATIVO → libera conteúdo premium,
// remove anúncios e dá acesso ao ambiente /app.
// ─────────────────────────────────────────────────────────────
export type SubscriptionStatus = "inactive" | "active" | "past_due" | "canceled";

export interface SubscriptionUser {
  id: string;
  email: string | null;
  name: string | null;
}

export interface SubscriptionState {
  loading: boolean;
  user: SubscriptionUser | null;
  isSubscriber: boolean;
  status: SubscriptionStatus | null;
  plan: string | null;
  periodEnd: string | null;
}

export const EMPTY_SUBSCRIPTION: SubscriptionState = {
  loading: true,
  user: null,
  isSubscriber: false,
  status: null,
  plan: null,
  periodEnd: null,
};

// Mesma regra do banco (is_active_subscriber): ativo se status='active'
// e ainda dentro do período (ou sem período definido logo após o checkout).
export function isActiveSub(status?: string | null, periodEnd?: string | null): boolean {
  if (status !== "active") return false;
  if (!periodEnd) return true;
  return new Date(periodEnd).getTime() > Date.now();
}

// Busca a sessão + a linha em `subscribers` e devolve o estado pronto.
export async function fetchSubscription(supabase: SupabaseClient): Promise<SubscriptionState> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return { ...EMPTY_SUBSCRIPTION, loading: false };

  const u = session.user;
  const user: SubscriptionUser = {
    id: u.id,
    email: u.email ?? null,
    name: (u.user_metadata?.name as string | undefined) ?? null,
  };

  const { data } = await supabase
    .from("subscribers")
    .select("status, plan, current_period_end")
    .eq("id", u.id)
    .maybeSingle();

  const status = (data?.status ?? null) as SubscriptionStatus | null;
  const periodEnd = (data?.current_period_end as string | null) ?? null;

  return {
    loading: false,
    user,
    isSubscriber: isActiveSub(status, periodEnd),
    status,
    plan: (data?.plan as string | null) ?? null,
    periodEnd,
  };
}
