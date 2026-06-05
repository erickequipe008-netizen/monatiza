"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: any) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    await supabase.from("profiles").insert({
      id: data.user?.id,
      name: name,
      display_name: name,
      email,
      role: "journalist",
    });

    alert("Conta criada com sucesso!");
    setLoading(false);
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-[#f4f4f5] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-3xl p-10 shadow-sm border border-gray-100">
        <h1 className="text-4xl font-black text-black mb-2">Criar conta</h1>
        <p className="text-gray-500 mb-8">Cadastro de jornalista</p>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2 text-black">
              Nome Completo
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-black">
              Nome Público (aparece no portal)
            </label>
            <input
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ex: Erick Boniz"
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-black">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-black">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none text-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-2xl font-semibold"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>
      </div>
    </main>
  );
}