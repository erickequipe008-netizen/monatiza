"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { User, Mail, Lock, Eye, EyeOff, Check } from "lucide-react";

const PLAN_LABEL: Record<string, string> = {
  mensal: "Plano Digital · mensal",
  anual: "Plano Anual · economize 2 meses",
};

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
      // 1) cria a conta
      const { data: signUpData, error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (signErr) {
        setError(signErr.message);
        return;
      }

      // 2) garante uma sessão (se a confirmação de e-mail estiver desligada, signUp já retorna sessão)
      let session = signUpData.session;
      if (!session) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr || !signInData.session) {
          setError("Conta criada! Confirme seu e-mail e depois faça login para concluir a assinatura.");
          return;
        }
        session = signInData.session;
      }

      // 3) inicia o checkout do Stripe
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plano }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        setError(json.error || "Não foi possível iniciar o pagamento.");
        return;
      }

      window.location.href = json.url; // redireciona para o Stripe
    } catch {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex bg-white">
      {/* ── Lado editorial ── */}
      <div className="hidden lg:flex lg:w-[44%] relative flex-col justify-between bg-[#0b0b0c] text-white px-14 py-16 overflow-hidden">
        <span className="pointer-events-none select-none absolute -top-10 -left-6 text-[#E0263B]/15 font-serif text-[420px] leading-none">
          {"“"}
        </span>

        <div className="relative z-10">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#E0263B]">
            Monatiza · Assinantes
          </span>

          <h1 className="mt-8 font-serif text-5xl leading-[1.15] font-bold max-w-sm">
            Jornalismo
            <br />
            <span className="text-[#E0263B]">que vale a pena.</span>
          </h1>

          <ul className="mt-8 space-y-3 text-sm text-white/70 max-w-xs">
            {["Acesso ilimitado e sem anúncios", "Newsletter premium", "Acesso à Revista Monatiza", "Conteúdo exclusivo de assinante"].map(
              (b) => (
                <li key={b} className="flex items-start gap-3">
                  <Check size={18} className="text-[#E0263B] shrink-0 mt-[1px]" strokeWidth={3} />
                  {b}
                </li>
              )
            )}
          </ul>
        </div>

        <div className="relative z-10 flex items-center gap-4 border-t border-white/10 pt-6 text-xs text-white/40">
          <span className="uppercase tracking-[0.3em]">Pagamento seguro</span>
          <span className="h-px flex-1 bg-white/10" />
          <span className="uppercase tracking-[0.3em]">via Stripe</span>
        </div>
      </div>

      {/* ── Lado formulário ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={handleSignup} className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-[#111]">Criar conta de assinante</h2>
            <p className="text-sm text-gray-500">
              {PLAN_LABEL[plano]} — você será levado ao pagamento em seguida.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-13 rounded-2xl border border-gray-200 bg-[#fafafa] pl-12 pr-4 text-sm text-[#111] placeholder:text-gray-400 outline-none transition focus:border-[#E0263B] focus:bg-white focus:ring-2 focus:ring-[#E0263B]/10"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-13 rounded-2xl border border-gray-200 bg-[#fafafa] pl-12 pr-4 text-sm text-[#111] placeholder:text-gray-400 outline-none transition focus:border-[#E0263B] focus:bg-white focus:ring-2 focus:ring-[#E0263B]/10"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-13 rounded-2xl border border-gray-200 bg-[#fafafa] pl-12 pr-12 text-sm text-[#111] placeholder:text-gray-400 outline-none transition focus:border-[#E0263B] focus:bg-white focus:ring-2 focus:ring-[#E0263B]/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Repetir senha"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                className="w-full h-13 rounded-2xl border border-gray-200 bg-[#fafafa] pl-12 pr-4 text-sm text-[#111] placeholder:text-gray-400 outline-none transition focus:border-[#E0263B] focus:bg-white focus:ring-2 focus:ring-[#E0263B]/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 rounded-2xl bg-[#111] text-white text-sm font-semibold transition hover:bg-[#E0263B] disabled:opacity-60"
          >
            {loading ? "Processando..." : "Continuar para o pagamento"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Já é assinante?{" "}
            <Link href="/painel/login" className="font-semibold text-[#111] hover:text-[#E0263B]">
              Entrar
            </Link>
          </p>
          <p className="text-center text-xs text-gray-400">
            É jornalista?{" "}
            <Link href="/register" className="underline hover:text-[#E0263B]">
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
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AssinarForm />
    </Suspense>
  );
}
