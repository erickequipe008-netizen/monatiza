"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Mail, ArrowLeft, Check } from "lucide-react";

// Recuperação de senha: envia o link mágico para redefinir.
export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/painel/redefinir`,
    });
    setLoading(false);
    if (err) {
      setError("Não foi possível enviar o e-mail. Confira o endereço e tente novamente.");
      return;
    }
    setSent(true);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08080b] p-6 text-white">
      <div className="pointer-events-none absolute -left-40 top-0 h-[460px] w-[560px] rounded-full bg-[#7C3AED]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[460px] w-[560px] rounded-full bg-[#FF2D87]/15 blur-[120px]" />

      <div className="relative w-full max-w-md space-y-6">
        <Link href="/painel/login" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft size={15} /> Voltar ao login
        </Link>

        {sent ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <span className="pro-gradient mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-white">
              <Check size={22} />
            </span>
            <h1 className="text-xl font-black">E-mail enviado</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Enviamos um link para <b className="text-zinc-200">{email}</b>. Abra o e-mail e toque no
              link para criar uma nova senha.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight">Recuperar senha</h1>
              <p className="text-sm text-zinc-400">Digite seu e-mail e enviaremos um link para criar uma nova senha.</p>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-13 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-12 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#9B72CB] focus:bg-white/[0.06] focus:ring-2 focus:ring-[#9B72CB]/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pro-gradient pro-glow h-13 w-full rounded-2xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Enviando…" : "Enviar link"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
