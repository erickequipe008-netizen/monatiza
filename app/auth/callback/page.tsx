"use client";

import { Suspense, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

/**
 * Retorno do OAuth (Google). O client Supabase troca o ?code= pela sessão
 * automaticamente; aqui só esperamos a sessão e decidimos o destino:
 *  • usuário NOVO (sem perfil na comunidade) → onboarding guiado.
 *  • usuário existente → segue para `next` (padrão /app).
 */
function CallbackInner() {
  const done = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/app";

    async function resolve() {
      if (done.current) return;
      const { data } = await supabase.auth.getSession();
      if (!data.session) return; // ainda processando o code; espera o onAuthStateChange
      done.current = true;

      const uid = data.session.user.id;
      const { data: prof } = await supabase
        .from("community_profiles")
        .select("user_id")
        .eq("user_id", uid)
        .maybeSingle();

      const dest = prof ? next : `/painel/boas-vindas?next=${encodeURIComponent(next)}`;
      window.location.replace(dest);
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) resolve();
    });
    resolve();

    // rede de segurança: se algo falhar, volta pro login
    const timer = setTimeout(() => {
      if (!done.current) window.location.replace("/painel/login");
    }, 7000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08080b] text-zinc-400">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={24} className="animate-spin text-[#1d9bf0]" />
        <p className="text-sm">Entrando…</p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08080b]" />}>
      <CallbackInner />
    </Suspense>
  );
}
