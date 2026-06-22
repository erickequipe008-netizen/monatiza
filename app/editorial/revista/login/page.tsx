"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function EditorialLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    // Chama a API route que valida a senha e seta o cookie httpOnly
    const res = await fetch("/api/editorial/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setErrorMsg("Senha incorreta. Tente novamente.");
      setLoading(false);
      return;
    }

    router.push("/editorial/revista");
  }

  return (
    <main className="min-h-screen flex bg-white">
      {/* ── Lado editorial ── */}
      <div className="hidden lg:flex lg:w-[44%] relative flex-col justify-between bg-[#0b0b0c] text-white px-14 py-16 overflow-hidden">
        <span className="pointer-events-none select-none absolute -top-10 -left-6 text-[#E0263B]/15 font-serif text-[420px] leading-none">
          "
        </span>

        <div className="relative z-10">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#E0263B]">
            Monatiza · Editorial
          </span>

          <h1 className="mt-8 font-serif text-5xl leading-[1.15] font-bold max-w-sm">
            Acesso
            <br />
            <span className="text-[#E0263B]">restrito.</span>
          </h1>

          <p className="mt-6 text-sm text-white/60 max-w-xs leading-relaxed">
            Área exclusiva da equipe editorial da Monatiza. Insira a
            senha de acesso para continuar.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 border-t border-white/10 pt-6 text-xs text-white/40">
          <span className="uppercase tracking-[0.3em]">Edição 2026</span>
          <span className="h-px flex-1 bg-white/10" />
          <span className="uppercase tracking-[0.3em]">Uso interno</span>
        </div>
      </div>

      {/* ── Lado formulário ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={handleLogin} className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-[#111]">
              Painel Editorial
            </h2>
            <p className="text-sm text-gray-500">
              Digite a senha de acesso da equipe.
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errorMsg}
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
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

          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 rounded-2xl bg-[#111] text-white text-sm font-semibold transition hover:bg-[#E0263B] disabled:opacity-60"
          >
            {loading ? "Verificando..." : "Acessar Editorial"}
          </button>

          <p className="text-center text-xs text-gray-400">
            Acesso exclusivo para a equipe Monatiza.
          </p>
        </form>
      </div>
    </main>
  );
}