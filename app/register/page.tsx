"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function RegisterPage() {

  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleRegister(
    e: React.FormEvent
  ) {

    e.preventDefault();

    setLoading(true);

    const {
      data,
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {

      alert(error.message);

      setLoading(false);

      return;
    }

    await supabase
      .from("journalists")
      .insert([
        {
          id: data.user?.id,
          name,
          email,
          role: "journalist",
        },
      ]);

    alert(
      "Conta criada com sucesso!"
    );

    router.push("/login");
  }

  return (

    <main className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 p-10 shadow-sm">

        <h1 className="text-4xl font-black text-black mb-2">
          Criar Conta
        </h1>

        <p className="text-gray-500 mb-8">
          Cadastro de jornalista
        </p>

        <form
          onSubmit={handleRegister}
          className="space-y-5"
        >

          <input
            type="text"
            placeholder="Nome completo"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="w-full h-14 px-5 rounded-2xl border border-gray-300 outline-none text-black"
            required
          />

          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full h-14 px-5 rounded-2xl border border-gray-300 outline-none text-black"
            required
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full h-14 px-5 rounded-2xl border border-gray-300 outline-none text-black"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-black text-white font-bold"
          >

            {loading
              ? "Criando..."
              : "Criar Conta"}

          </button>

        </form>

      </div>

    </main>
  );
}