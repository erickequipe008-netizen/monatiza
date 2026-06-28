"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { Crown, LogOut, CreditCard, Lock, Clock3 } from "lucide-react";

interface Subscriber {
  status: string;
  plan: string | null;
  current_period_end: string | null;
  name: string | null;
}

interface Article {
  id: number;
  slug: string;
  title: string;
  image_url: string;
  category: string;
  created_at: string;
}

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  active: { label: "Ativa", tone: "bg-green-100 text-green-700" },
  past_due: { label: "Pagamento pendente", tone: "bg-amber-100 text-amber-700" },
  canceled: { label: "Cancelada", tone: "bg-zinc-200 text-zinc-600" },
  inactive: { label: "Aguardando pagamento", tone: "bg-amber-100 text-amber-700" },
};

export default function PainelPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userName, setUserName] = useState("");
  const [sub, setSub] = useState<Subscriber | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let tries = 0;
    const justPaid =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("sucesso") === "1";

    async function check() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/painel/login");
        return;
      }
      setUserName((session.user.user_metadata?.name as string) || session.user.email || "Assinante");

      const { data: subData } = await supabase
        .from("subscribers")
        .select("status, plan, current_period_end, name")
        .eq("id", session.user.id)
        .maybeSingle();
      if (cancelled) return;

      // Assinante ativo entra direto no ambiente premium.
      if ((subData as Subscriber | null)?.status === "active") {
        router.replace("/app");
        return;
      }

      setSub(subData as Subscriber | null);

      const { data: arts } = await supabase
        .from("articles")
        .select("id, slug, title, image_url, category, created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      if (cancelled) return;
      setArticles((arts as Article[]) || []);
      setChecking(false);

      // Acabou de pagar mas o webhook do Stripe ainda não confirmou → re-tenta.
      if (justPaid && tries < 8) {
        tries++;
        setTimeout(check, 3000);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function openPortal() {
    setPortalLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push("/painel/login");
      return;
    }
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const json = await res.json();
    if (json.url) {
      window.location.href = json.url;
    } else {
      alert(json.error || "Não foi possível abrir o portal de cobrança.");
      setPortalLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (checking) {
    return (
      <div className="bg-[#f5f5f5] min-h-screen flex items-center justify-center text-zinc-400 text-sm">
        Carregando sua área...
      </div>
    );
  }

  const status = sub?.status ?? "inactive";
  const active = status === "active";
  const statusInfo = STATUS_LABEL[status] ?? STATUS_LABEL.inactive;

  return (
    <div className="bg-[#f5f5f5] min-h-screen text-black">
      {/* faixa de boas-vindas */}
      <section className="bg-black text-white">
        <div className="max-w-[1100px] mx-auto px-4 md:px-5 py-10 flex items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-red-500 text-[11px] font-black uppercase tracking-widest">
              <Crown size={14} /> Área do assinante
            </span>
            <h1 className="text-[24px] md:text-[30px] font-black tracking-tight mt-2">Olá, {userName}</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition shrink-0"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </section>

      <main className="max-w-[1100px] mx-auto px-4 md:px-5 py-10 space-y-10">
        {/* cartão de assinatura */}
        <div className="bg-white border border-zinc-200 p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Sua assinatura
              </span>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusInfo.tone}`}>
                  {statusInfo.label}
                </span>
                {sub?.plan && (
                  <span className="text-sm text-zinc-500 capitalize">Plano {sub.plan}</span>
                )}
              </div>
            </div>

            {active ? (
              <button
                onClick={openPortal}
                disabled={portalLoading}
                className="flex items-center gap-2 bg-black text-white px-5 py-3 text-sm font-bold hover:opacity-80 transition disabled:opacity-60"
              >
                <CreditCard size={16} />
                {portalLoading ? "Abrindo..." : "Gerenciar assinatura"}
              </button>
            ) : (
              <Link
                href="/assinantes"
                className="bg-red-600 text-white px-5 py-3 text-sm font-bold hover:bg-red-700 transition"
              >
                Finalizar assinatura
              </Link>
            )}
          </div>

          {!active && (
            <p className="text-sm text-zinc-500 mt-5 leading-relaxed">
              Seu acesso de assinante é liberado assim que o pagamento for confirmado. Se você
              acabou de pagar, aguarde alguns instantes e recarregue a página.
            </p>
          )}
        </div>

        {/* conteúdo de assinante */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
              Conteúdo de assinante
            </span>
            <div className="flex-1 h-px bg-zinc-300" />
          </div>

          {active ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a) => (
                <Link key={a.id} href={`/noticia/${a.slug}`} className="group block bg-white border border-zinc-200">
                  <div className="relative w-full h-[170px] overflow-hidden">
                    <Image
                      src={a.image_url}
                      alt={a.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-red-600 font-bold uppercase text-[10px] tracking-wider">
                      {a.category}
                    </span>
                    <h3 className="text-[15px] font-bold leading-snug mt-1 group-hover:text-red-600 transition line-clamp-2">
                      {a.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-zinc-400 text-xs">
                      <Clock3 size={12} />
                      <span>{new Date(a.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 p-10 text-center">
              <Lock size={36} className="mx-auto text-zinc-300 mb-4" />
              <h3 className="text-lg font-bold text-zinc-500">Conteúdo bloqueado</h3>
              <p className="text-sm text-zinc-400 mt-2">
                Conclua sua assinatura para liberar o conteúdo exclusivo.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
