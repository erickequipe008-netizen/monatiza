"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { X, Eye, EyeOff, Check, Loader2, AtSign } from "lucide-react";

const PLAN_LABEL: Record<string, string> = {
  mensal: "MonatizaPlus Mensal · R$ 19,90/mês · teste grátis",
  anual: "MonatizaPlus Anual · R$ 199/ano · economize 2 meses",
};

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

// Item do checklist de senha (bolinha roxa com check, como nas grandes redes).
function Rule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2.5 text-[13.5px]">
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full transition ${
          ok ? "pro-gradient text-white" : "border border-zinc-300 text-transparent"
        }`}
      >
        <Check size={12} strokeWidth={3} />
      </span>
      <span className={ok ? "text-zinc-700" : "text-zinc-400"}>{label}</span>
    </li>
  );
}

const inputCls =
  "h-13 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-[#9B72CB] focus:bg-white focus:ring-2 focus:ring-[#9B72CB]/15";

function AssinarForm() {
  const params = useSearchParams();
  const plano: "mensal" | "anual" = params.get("plano") === "anual" ? "anual" : "mensal";

  const [step, setStep] = useState<1 | 2>(1);
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const rules = {
    len: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
  };
  const emailOk = /.+@.+\..+/.test(email);
  const step1Ok = handle.length >= 3 && rules.len && rules.upper && rules.lower && emailOk;

  async function next() {
    setError("");
    if (!step1Ok) return;
    // melhor esforço: avisa se o @ já estiver em uso
    const { count } = await supabase
      .from("community_profiles")
      .select("user_id", { count: "exact", head: true })
      .eq("handle", handle);
    if (count) {
      setError("Esse nome de usuário já está em uso. Escolha outro.");
      return;
    }
    setStep(2);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Digite seu nome completo.");

    setLoading(true);
    try {
      const { data: signUpData, error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name.trim(), handle } },
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08080b] p-4">
      <div className="pointer-events-none absolute -left-40 top-0 h-[460px] w-[560px] rounded-full bg-[#7C3AED]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[460px] w-[560px] rounded-full bg-[#FF2D87]/15 blur-[120px]" />

      {/* cartão central estilo grande rede social */}
      <div className="pro-pop relative w-full max-w-[520px] rounded-3xl bg-white p-7 text-zinc-900 shadow-2xl sm:p-9">
        {/* topo: fechar + bolinhas de etapa */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/assinantes" aria-label="Fechar" className="text-zinc-500 transition hover:text-zinc-900">
            <X size={22} />
          </Link>
          <div className="flex items-center gap-1.5">
            {[1, 2].map((s) => (
              <span
                key={s}
                className={`h-2 w-2 rounded-full transition ${step === s ? "pro-gradient" : "bg-zinc-300"}`}
              />
            ))}
          </div>
        </div>

        {step === 1 ? (
          <>
            <h1 className="text-[26px] font-black tracking-tight sm:text-[30px]">Informações da conta</h1>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            <div className="mt-6 space-y-5">
              <div>
                <label className="text-[15px] font-bold">Seu nome de usuário</label>
                <p className="mb-2 text-[13px] text-zinc-500">Pode conter apenas letras de A a Z, números de 0 a 9 e sublinhado.</p>
                <div className="relative">
                  <AtSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase().slice(0, 20))}
                    placeholder="seunome"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </div>

              <div>
                <label className="text-[15px] font-bold">Senha</label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Crie uma senha"
                    className={`${inputCls} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <ul className="mt-3 space-y-2">
                  <Rule ok={rules.len} label="8 caracteres" />
                  <Rule ok={rules.upper} label="1 letra maiúscula" />
                  <Rule ok={rules.lower} label="1 letra minúscula" />
                </ul>
              </div>

              <div>
                <label className="text-[15px] font-bold">E-mail</label>
                <p className="mb-2 text-[13px] text-zinc-500">
                  Usamos seu e-mail para acesso, suporte e recuperação da conta.
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  className={inputCls}
                />
              </div>
            </div>

            <button
              onClick={next}
              disabled={!step1Ok}
              className="pro-gradient mt-7 h-13 w-full rounded-full text-[15px] font-bold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              Próximo
            </button>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-zinc-200" />
              <span className="text-[11px] uppercase tracking-widest text-zinc-400">ou</span>
              <span className="h-px flex-1 bg-zinc-200" />
            </div>

            <button
              type="button"
              onClick={signupGoogle}
              className="flex h-13 w-full items-center justify-center gap-2.5 rounded-full border border-zinc-200 text-[15px] font-bold text-zinc-800 transition hover:bg-zinc-50"
            >
              <GoogleG /> Continuar com Google
            </button>

            <p className="mt-5 text-center text-sm text-zinc-500">
              Já tem conta?{" "}
              <Link href="/painel/login" className="pro-gradient-text font-bold">
                Entrar
              </Link>
            </p>
          </>
        ) : (
          <form onSubmit={handleSignup}>
            <h1 className="text-[26px] font-black tracking-tight sm:text-[30px]">Quase lá</h1>
            <p className="mt-1 text-[14px] text-zinc-500">{PLAN_LABEL[plano]}</p>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            <div className="mt-6">
              <label className="text-[15px] font-bold">Nome completo</label>
              <p className="mb-2 text-[13px] text-zinc-500">É como você aparece na comunidade.</p>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required className={inputCls} />
            </div>

            <div className="mt-5 rounded-2xl bg-zinc-50 p-4 text-[13.5px] text-zinc-600">
              <p>
                <b className="text-zinc-900">@{handle}</b> · {email}
              </p>
              <button type="button" onClick={() => setStep(1)} className="pro-gradient-text mt-1 text-[13px] font-bold">
                Editar informações
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pro-gradient mt-7 flex h-13 w-full items-center justify-center gap-2 rounded-full text-[15px] font-bold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Criando conta…" : "Criar conta e continuar"}
            </button>

            <p className="mt-4 text-center text-[12px] leading-relaxed text-zinc-400">
              Ao continuar, você concorda com os{" "}
              <Link href="/termos" className="underline">Termos</Link> e a{" "}
              <Link href="/privacy" className="underline">Política de Privacidade</Link>. Você vai para o
              pagamento seguro em seguida.
            </p>
          </form>
        )}
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
