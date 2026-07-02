"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { User, Mail, Lock, Eye, EyeOff, Check, Crown } from "lucide-react";

const PLAN_LABEL: Record<string, string> = {
  mensal: "MonatizaPlus · mensal",
  anual: "MonatizaPlus · anual (economize 2 meses)",
};

const inputCls =
  "w-full h-13 rounded-2xl border border-white/10 bg-white/[0.04] pl-12 pr-12 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#9B72CB] focus:bg-white/[0.06] focus:ring-2 focus:ring-[#9B72CB]/20";

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

function AssinarForm() {
  const params = useSearchParams();
  const plano: "mensal" | "anual" = params.get("plano") === "anual" ? "anual" : "mensal";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Digite seu nome.");
    if (password.length < 6) return setError("A senha deve ter no mínimo 6 caracteres.");
    if (password !== confirm) return setError("As senhas não coincidem.");

    setLoading(true);
    try {
      const { data: signUpData, error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (signErr) {
        setError(signErr.message);
        return;
      }

      let session = signUpData.session;
      if (!session) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr || !signInData.session) {
          setError("Conta criada! Confirme seu e-mail e depois faça login para concluir a assinatura.");
          return;
        }
        session = signInData.session;
      }

      if (!session) {
        setError("Não foi possível iniciar a sessão.");
        return;
      }
      window.location.href = `/assinar/pagamento?plano=${plano}`;
    } catch {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function signupGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/assinar/pagamento?plano=${plano}` },
    });
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#08080b] text-white">
      <div className="pointer-events-none absolute -left-40 top-0 h-[460px] w-[560px] rounded-full bg-[#7C3AED]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[460px] w-[560px] rounded-full bg-[#FF2D87]/15 blur-[120px]" />

      {/* ── Lado marca ── */}
      <div className="relative hidden w-[44%] flex-col justify-between border-r border-white/10 px-14 py-16 lg:flex">
        <div className="relative z-10">
          <span className="pro-gradient-text inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.3em]">
            <Crown size={14} /> MonatizaPlus
          </span>
          <h1 className="mt-8 max-w-sm text-5xl font-black leading-[1.1] tracking-tight">
            Jornalismo
            <br />
            <span className="pro-gradient-text">que vale a pena.</span>
          </h1>
          <ul className="mt-8 space-y-3 text-sm text-zinc-300">
            {["Acesso ilimitado e sem anúncios", "Newsletter premium", "Revista Monatiza", "Comunidade e mensagens"].map((b) => (
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
          <span className="uppercase tracking-[0.3em]">Pagamento seguro</span>
          <span className="h-px flex-1 bg-white/10" />
          <span className="pro-gradient-text uppercase tracking-[0.3em]">monatiza</span>
        </div>
      </div>

      {/* ── Lado formulário ── */}
      <div className="relative flex flex-1 items-center justify-center p-6 sm:p-10">
        <form onSubmit={handleSignup} className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight">Criar sua conta</h2>
            <p className="text-sm text-zinc-400">{PLAN_LABEL[plano]} — você vai para o pagamento em seguida.</p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input type="text" placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
            </div>
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
                minLength={6}
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
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Repetir senha"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                className={inputCls}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="pro-gradient pro-glow h-13 w-full rounded-2xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Processando…" : "Continuar para o pagamento"}
          </button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-[11px] uppercase tracking-widest text-zinc-500">ou</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={signupGoogle}
            className="pro-glass flex h-13 w-full items-center justify-center gap-2.5 rounded-2xl text-sm font-bold text-white"
          >
            <GoogleG /> Cadastrar com Google
          </button>

          <p className="text-center text-sm text-zinc-400">
            Já é assinante?{" "}
            <Link href="/painel/login" className="pro-gradient-text font-bold">
              Entrar
            </Link>
          </p>
          <p className="text-center text-xs text-zinc-500">
            É jornalista?{" "}
            <Link href="/register" className="underline hover:text-white">
              Cadastro da redação
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default function AssinarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08080b]" />}>
      <AssinarForm />
    </Suspense>
  );
}
