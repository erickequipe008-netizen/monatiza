"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import {
  User,
  Newspaper,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [journalismName, setJournalismName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleRegister(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Digite seu nome");
      return;
    }

    if (password !== confirmPassword) {
      alert("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      alert(
        "A senha deve ter no mínimo 6 caracteres"
      );
      return;
    }

    try {
      setLoading(true);

      // CRIA USUÁRIO AUTH
      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            display_name:
              journalismName || name,
          },
        },
      });

      if (error) {
        alert(error.message);
        return;
      }

      const user = data.user;

      if (!user) {
        alert("Erro ao criar usuário");
        return;
      }

      // PROFILE
      const {
        error: profileError,
      } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          name: name,
          display_name:
            journalismName || name,
          email: email,
        });

      if (profileError) {
        console.log(profileError);

        alert(
          "Erro ao salvar perfil"
        );

        return;
      }

      // JOURNALIST
      const {
        error: journalistError,
      } = await supabase
        .from("journalists")
        .upsert({
          id: user.id,
          name:
            journalismName || name,
          email: email,
          role: "journalist",
        });

      if (journalistError) {
        console.log(
          journalistError
        );

        alert(
          "Erro ao salvar jornalista"
        );

        return;
      }

      alert(
        "Conta criada com sucesso!"
      );

      router.push("/login");
    } catch (err) {
      console.log(err);

      alert(
        "Erro inesperado ao criar conta"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setGoogleLoading(true);

      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });

      if (error) {
        alert(error.message);
      }
    } catch (err) {
      console.log(err);

      alert(
        "Erro ao conectar Google"
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex bg-white">
      {/* LADO EDITORIAL */}
      <div className="hidden lg:flex lg:w-[44%] relative flex-col justify-between bg-[#0b0b0c] text-white px-14 py-16 overflow-hidden">
        {/* Aspas decorativas gigantes */}
        <span className="pointer-events-none select-none absolute -top-10 -left-6 text-[#E0263B]/15 font-serif text-[420px] leading-none">
          "
        </span>

        <div className="relative z-10">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[#E0263B]">
            Monatiza · Redação
          </span>

          <h1 className="mt-8 font-serif text-5xl leading-[1.15] font-bold max-w-sm">
            Sua voz tem
            <br />
            <span className="text-[#E0263B]">espaço aqui.</span>
          </h1>

          <p className="mt-6 text-sm text-white/60 max-w-xs leading-relaxed">
            Crie sua conta de jornalista e comece a publicar com a
            credibilidade da Monatiza. Pauta, edição e distribuição,
            tudo em um só lugar.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 border-t border-white/10 pt-6 text-xs text-white/40">
          <span className="uppercase tracking-[0.3em]">
            Edição 2026
          </span>
          <span className="h-px flex-1 bg-white/10" />
          <span className="uppercase tracking-[0.3em]">
            Redação aberta
          </span>
        </div>
      </div>

      {/* LADO FORMULÁRIO */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <form
          onSubmit={handleRegister}
          className="w-full max-w-md space-y-6"
        >
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-[#111]">
              Criar conta
            </h2>
            <p className="text-sm text-gray-500">
              Preencha seus dados para entrar na redação.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
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
              <Newspaper className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="Nome de jornalismo (assinatura)"
                value={journalismName}
                onChange={(e) => setJournalismName(e.target.value)}
                className="w-full h-13 rounded-2xl border border-gray-200 bg-[#fafafa] pl-12 pr-4 text-sm text-[#111] placeholder:text-gray-400 outline-none transition focus:border-[#E0263B] focus:bg-white focus:ring-2 focus:ring-[#E0263B]/10"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
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
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
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
                aria-label={
                  showPassword ? "Ocultar senha" : "Mostrar senha"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repetir senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-13 rounded-2xl border border-gray-200 bg-[#fafafa] pl-12 pr-12 text-sm text-[#111] placeholder:text-gray-400 outline-none transition focus:border-[#E0263B] focus:bg-white focus:ring-2 focus:ring-[#E0263B]/10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={
                  showConfirmPassword
                    ? "Ocultar senha"
                    : "Mostrar senha"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-13 rounded-2xl bg-[#111] text-white text-sm font-semibold transition hover:bg-[#E0263B] disabled:opacity-60"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-xs uppercase tracking-[0.2em] text-gray-400">
              ou
            </span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full h-13 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-[#111] flex items-center justify-center gap-3 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-60"
          >
            <svg
              className="h-4.5 w-4.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.86c2.26-2.08 3.56-5.15 3.56-8.66z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.86-3.01c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1C3.24 21.3 7.28 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.28A7.2 7.2 0 0 1 4.86 12c0-.79.14-1.56.39-2.28v-3.1H1.27A11.94 11.94 0 0 0 0 12c0 1.93.46 3.76 1.27 5.38l4-3.1z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.28 0 3.24 2.7 1.27 6.62l4 3.1C6.22 6.87 8.87 4.75 12 4.75z"
              />
            </svg>
            {googleLoading
              ? "Conectando..."
              : "Continuar com o Google"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#111] hover:text-[#E0263B]"
            >
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}