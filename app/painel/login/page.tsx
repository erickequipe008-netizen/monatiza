"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Mail, Lock, Eye, EyeOff, Check } from "lucide-react";

export default function PainelLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signErr) {
      setError("E-mail ou senha incorretos. Tente novamente.");
      setLoading(false);
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(next || "/app");
  }

  const inputCls =
    "w-full h-13 rounded-2xl border border-white/10 bg-white/[0.04] pl-12 pr-12 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#1d9bf0] focus:bg-white/[0.06] focus:ring-2 focus:ring-[#1d9bf0]/20";

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#08080b] text-white">
      <div className="pointer-events-none absolute -left-40 top-0 h-[460px] w-[560px] rounded-full bg-[#1d9bf0]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[460px] w-[560px] rounded-full bg-[#1d9bf0]/15 blur-[120px]" />

      {/* ── Lado marca ── */}
      <div className="relative hidden w-[44%] flex-col justify-between border-r border-white/10 px-14 py-16 lg:flex">
        <div className="relative z-10">
          <span className="pro-gradient-text inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.3em]">
            Monatiza
          </span>
          <h1 className="mt-8 max-w-sm text-5xl font-black leading-[1.1] tracking-tight">
            Bem-vindo
            <br />
            <span className="pro-gradient-text">de volta.</span>
          </h1>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-zinc-400">
            Entre para acessar as notícias, a comunidade e o seu perfil.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-zinc-300">
            {["Notícias e análises", "Comunidade e mensagens", "Seu perfil e biblioteca"].map((b) => (
              <li key={b} className="flex items-center gap-3">
                <span className="pro-gradient flex h-5 w-5 items-center justify-center rounded-full">
                  <Check size={12} strokeWidth={3} className="text-white" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative z-10 flex items-center gap-4 border-t border-white/10 pt-6 text-xs text-zinc-500">
          <span className="uppercase tracking-[0.3em]">Sua conta</span>
          <span className="h-px flex-1 bg-white/10" />
          <span className="pro-gradient-text uppercase tracking-[0.3em]">monatiza</span>
        </div>
      </div>

      {/* ── Lado formulário ── */}
      <div className="relative flex flex-1 items-center justify-center p-6 sm:p-10">
        <form onSubmit={handleLogin} className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight">Entrar</h2>
            <p className="text-sm text-zinc-400">Entre na sua conta.</p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="text-right">
              <Link href="/painel/recuperar" className="text-[13px] font-semibold text-zinc-400 hover:text-white">
                Esqueceu a senha?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="pro-gradient pro-glow h-13 w-full rounded-2xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>

          <p className="text-center text-sm text-zinc-400">
            Não tem conta?{" "}
            <Link href="/painel/cadastro" className="pro-gradient-text font-bold">
              Criar conta
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
