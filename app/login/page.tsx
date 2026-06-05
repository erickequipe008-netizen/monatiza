"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {

  const router =
    useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleLogin(
    e: React.FormEvent
  ) {

    e.preventDefault();

    setLoading(true);

    const { data, error } =
      await supabase.auth
        .signInWithPassword({

          email,
          password,

        });

    if (error) {

      alert(error.message);

      setLoading(false);

      return;
    }

    document.cookie =
      `sb-access-token=${data.session.access_token}; path=/`;

    router.push(
      "/admin/dashboard"
    );
  }

  return (

    <main className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 p-10 shadow-sm">

        <h1 className="text-4xl font-black text-black mb-2">

          MONATIZA

        </h1>

        <p className="text-gray-500 mb-8">

          Painel editorial

        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="w-full h-14 px-5 rounded-2xl border border-gray-300 outline-none text-black"
          />

          <input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="w-full h-14 px-5 rounded-2xl border border-gray-300 outline-none text-black"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-black text-white font-bold hover:opacity-90 transition"
          >

            {loading
              ? "Entrando..."
              : "Entrar"}

          </button>

        </form>

      </div>

    </main>

  );
}
<div className="text-center mt-6">

  <p className="text-gray-500">
    Não possui conta?
  </p>

  <a
    href="/register"
    className="text-black font-bold hover:underline"
  >
    Criar conta
  </a>

</div>