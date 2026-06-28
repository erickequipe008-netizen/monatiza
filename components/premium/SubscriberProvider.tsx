"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  EMPTY_SUBSCRIPTION,
  fetchSubscription,
  type SubscriptionState,
} from "@/lib/premium/access";

interface SubscriberCtx extends SubscriptionState {
  /** Recarrega o status (ex.: após o pagamento ser confirmado). */
  refresh: () => Promise<void>;
}

const Ctx = createContext<SubscriberCtx>({
  ...EMPTY_SUBSCRIPTION,
  refresh: async () => {},
});

/** Estado de assinatura disponível em todo o site (anúncios, paywall, /app). */
export function useSubscriber() {
  return useContext(Ctx);
}

export default function SubscriberProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<SubscriptionState>(EMPTY_SUBSCRIPTION);

  const refresh = useCallback(async () => {
    try {
      setState(await fetchSubscription(supabase));
    } catch {
      setState({ ...EMPTY_SUBSCRIPTION, loading: false });
    }
  }, []);

  useEffect(() => {
    refresh();
    // Reage a login/logout/refresh de token sem precisar recarregar a página.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => subscription.unsubscribe();
  }, [refresh]);

  return <Ctx.Provider value={{ ...state, refresh }}>{children}</Ctx.Provider>;
}
