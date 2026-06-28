"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

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
    // Respeita ?next= (ex.: vindo do /app); senão vai para /painel, que
    // encaminha assinantes ativos direto para o ambiente premium (/app).
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(next || "/painel");
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
            Bem-vindo
            <br />
            <span className="text-[#E0263B]">de volta.</span>
          </h1>
          <p className="mt-6 text-sm text-white/60 max-w-xs leading-relaxed">
            Acesse sua área de assinante e aproveite todo o conteúdo da Monatiza.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-4 border-t border-white/10 pt-6 text-xs text-white/40">
          <span className="uppercase tracking-[0.3em]">Área de membros</span>
          <span className="h-px flex-1 bg-white/10" />
          <span className="uppercase tracking-[0.3em]">Monatiza</span>
        </div>
      </div>

      {/* ── Lado formulário ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={handleLogin} className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-[#111]">Entrar</h2>
            <p className="text-sm text-gray-500">Acesse sua área de assinante.</p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 rounded-2xl bg-[#111] text-white text-sm font-semibold transition hover:bg-[#E0263B] disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Ainda não é assinante?{" "}
            <Link href="/assinantes" className="font-semibold text-[#111] hover:text-[#E0263B]">
              Ver planos
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
