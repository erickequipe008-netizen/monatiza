"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 8.1 29.3 6 24 6 14.1 6 6 14.1 6 24s8.1 18 18 18 18-8.1 18-18c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M8.3 14.7l6.6 4.8C16.7 15.1 20 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 8.1 29.3 6 24 6 16.3 6 9.7 10.3 6.6 16.6l1.7-1.9z" />
      <path fill="#4CAF50" d="M24 42c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 33 26.7 34 24 34c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 37.6 16.2 42 24 42z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.2 5.3c-.4.4 6.5-4.8 6.5-14.9 0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

/**
 * Botão "Continuar com o Google" (OAuth Supabase). Volta pelo /auth/callback,
 * que já encaminha usuários novos para o onboarding.
 */
export default function GoogleAuthButton({
  next = "/app",
  label = "Continuar com o Google",
}: {
  next?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={go}
      disabled={busy}
      className="flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white/[0.05] text-sm font-bold text-white transition hover:bg-white/[0.09] disabled:opacity-60"
    >
      {busy ? <Loader2 size={18} className="animate-spin" /> : <GoogleMark />}
      {busy ? "Conectando…" : label}
    </button>
  );
}
