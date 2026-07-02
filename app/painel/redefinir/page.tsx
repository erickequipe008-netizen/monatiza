"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Lock, Eye, EyeOff } from "lucide-react";

// Chegou aqui pelo link do e-mail de recuperação: define a nova senha.
export default function RedefinirPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // o supabase-js processa o token do link automaticamente e cria a sessão
  useEffect(() => {
    const t = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) setError("Link inválido ou expirado. Peça um novo em Recuperar senha.");
      setReady(true);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) return setError("A senha deve ter no mínimo 6 caracteres.");
    if (password !== confirm) return setError("As senhas não coincidem.");
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError("Não foi possível salvar. Tente novamente.");
      return;
    }
    router.push("/painel");
  }

  const inputCls =
    "h-13 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-12 pr-12 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#9B72CB] focus:bg-white/[0.06] focus:ring-2 focus:ring-[#9B72CB]/20";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08080b] p-6 text-white">
      <div className="pointer-events-none absolute -left-40 top-0 h-[460px] w-[560px] rounded-full bg-[#7C3AED]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[460px] w-[560px] rounded-full bg-[#FF2D87]/15 blur-[120px]" />

      <form onSubmit={handleSave} className="relative w-full max-w-md space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight">Nova senha</h1>
          <p className="text-sm text-zinc-400">Crie a nova senha da sua conta.</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
        )}

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type={show ? "text" : "password"}
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type={show ? "text" : "password"}
            placeholder="Repetir nova senha"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            className={inputCls}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !ready}
          className="pro-gradient pro-glow h-13 w-full rounded-2xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Salvando…" : "Salvar nova senha"}
        </button>
      </form>
    </main>
  );
}
