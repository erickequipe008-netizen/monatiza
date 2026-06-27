"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { FileText, Clock3, CreditCard, CheckCircle2, Plus } from "lucide-react";

interface Profile {
  name: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
}

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({ publicados: 0, pendentes: 0, disponiveis: 0, usados: 0 });

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const meta = (user.user_metadata ?? {}) as { display_name?: string; name?: string };
      const { data: j } = await supabase
        .from("journalists")
        .select("name, display_name, avatar_url, email, created_at")
        .eq("id", user.id)
        .maybeSingle();

      setProfile({
        name: j?.display_name || j?.name || meta.display_name || meta.name || "Jornalista",
        email: user.email || j?.email || "",
        avatarUrl: j?.avatar_url || "",
        createdAt: j?.created_at || user.created_at || "",
      });

      const { data: arts } = await supabase.from("articles").select("status").eq("author_id", user.id);
      const list = arts || [];
      const publicados = list.filter((a) => a.status === "publicado").length;
      const pendentes = list.filter((a) => a.status === "em_analise" || a.status === "aprovado").length;

      const { data: c } = await supabase
        .from("journalist_credits")
        .select("balance, total_used")
        .eq("journalist_id", user.id)
        .maybeSingle();

      setStats({ publicados, pendentes, disponiveis: c?.balance ?? 0, usados: c?.total_used ?? 0 });
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="p-10 text-sm text-zinc-400">Carregando…</div>;
  }

  const cards = [
    { label: "Artigos publicados", value: stats.publicados, icon: FileText, accent: "#0b0b0c" },
    { label: "Em análise", value: stats.pendentes, icon: Clock3, accent: "#F59E0B" },
    { label: "Créditos disponíveis", value: stats.disponiveis, icon: CreditCard, accent: "#E0263B" },
    { label: "Créditos utilizados", value: stats.usados, icon: CheckCircle2, accent: "#10B981" },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-8">
      {/* Perfil */}
      <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 flex items-center gap-5">
        {profile?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.avatarUrl} alt={profile.name} className="w-16 h-16 rounded-2xl object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-[#0b0b0c] text-white flex items-center justify-center text-xl font-black">
            {(profile?.name || "M").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-black text-[#0b0b0c] leading-tight truncate">{profile?.name}</h1>
          <p className="text-sm text-zinc-500 truncate">{profile?.email}</p>
          {profile?.createdAt && (
            <p className="text-xs text-zinc-400 mt-0.5">
              Na Monatiza desde {new Date(profile.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white border border-[#E8E6E1] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] uppercase tracking-[0.15em] text-zinc-400">{c.label}</p>
                <Icon size={16} style={{ color: c.accent }} />
              </div>
              <p className="text-4xl font-black leading-none" style={{ color: c.accent }}>
                {c.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Ações */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.disponiveis > 0 ? (
          <Link
            href="/dashboard/novo"
            className="group bg-[#0b0b0c] rounded-2xl px-6 py-5 flex items-center justify-between hover:bg-[#E0263B] transition-colors"
          >
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/40 mb-1">Publicar</p>
              <p className="text-white font-bold">Nova publicação</p>
            </div>
            <Plus size={20} className="text-white" />
          </Link>
        ) : (
          <Link
            href="/dashboard/creditos"
            className="group bg-[#E0263B] rounded-2xl px-6 py-5 flex items-center justify-between hover:opacity-90 transition"
          >
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60 mb-1">Sem créditos</p>
              <p className="text-white font-bold">Comprar créditos para publicar</p>
            </div>
            <CreditCard size={20} className="text-white" />
          </Link>
        )}

        <Link
          href="/dashboard/publicacoes"
          className="group bg-white border border-[#E8E6E1] rounded-2xl px-6 py-5 flex items-center justify-between hover:border-[#0b0b0c] transition-colors"
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 mb-1">Arquivo</p>
            <p className="text-[#0b0b0c] font-bold">Minhas publicações</p>
          </div>
          <FileText size={20} className="text-zinc-400" />
        </Link>
      </div>
    </main>
  );
}
