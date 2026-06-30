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
          <span className="pro-gradient-text uppercase tracking-[0.3em]">via Stripe</span>
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
