"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { User, AtSign, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

const inputCls =
  "h-13 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#9B72CB] focus:bg-white/[0.06] focus:ring-2 focus:ring-[#9B72CB]/20";

function CadastroForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/app";

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Digite seu nome.");
    if (handle.length < 3) return setError("Escolha um nome de usuário (mín. 3 caracteres).");
    if (password.length < 6) return setError("A senha deve ter no mínimo 6 caracteres.");

    setBusy(true);
    try {
      const { data: up, error: upErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name.trim(), handle } },
      });
      if (upErr) {
        setError(upErr.message);
        return;
      }
      if (!up.session) {
        const { error: inErr } = await supabase.auth.signInWithPassword({ email, password });
        if (inErr) {
          setError("Conta criada! Confirme seu e-mail e depois faça login.");
          return;
        }
      }
      window.location.href = next;
    } catch {
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08080b] p-4 text-white">
      <div className="pointer-events-none absolute -left-40 top-0 h-[460px] w-[560px] rounded-full bg-[#7C3AED]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[460px] w-[560px] rounded-full bg-[#FF2D87]/15 blur-[120px]" />

      <form onSubmit={submit} className="pro-pop relative w-full max-w-[460px] space-y-3.5 rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-8">
        <div className="mb-2">
          <span className="text-[24px] font-black tracking-tight">Criar conta grátis</span>
          <p className="mt-1 text-[14px] text-zinc-400">Entre na comunidade Monatiza — é grátis.</p>
        </div>

        {error && <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

        <div className="relative">
          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" className={`${inputCls} pl-11`} />
        </div>
        <div className="relative">
          <AtSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase().slice(0, 20))}
            placeholder="nome de usuário"
            className={`${inputCls} pl-11`}
          />
        </div>
        <div className="relative">
          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required className={`${inputCls} pl-11`} />
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            required
            className={`${inputCls} pl-11 pr-11`}
          />
          <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300" aria-label="Mostrar senha">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="pro-gradient pro-glow flex h-13 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          {busy ? "Criando conta…" : "Criar conta e entrar"}
        </button>

        <p className="text-center text-[13px] text-zinc-500">
          Já tem conta?{" "}
          <Link href="/painel/login" className="pro-gradient-text font-bold">
            Entrar
          </Link>
        </p>
      </form>
    </main>
  );
}

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08080b]" />}>
      <CadastroForm />
    </Suspense>
  );
}
