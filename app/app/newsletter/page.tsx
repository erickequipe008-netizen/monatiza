"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Check, Bell, BellOff, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { fetchLatest, type ArticleCard } from "@/lib/premium/articles";
import { Spinner, PageHeader, EmptyState } from "@/components/premium/States";

const CATEGORIES = [
  "Negócios", "IA", "Mercado", "Brasil", "Política",
  "Tech", "Empreende", "Startups", "Carreira", "Saúde", "Revista",
];
const FREQUENCIES = [
  { key: "diaria", label: "Diária" },
  { key: "semanal", label: "Semanal" },
  { key: "mensal", label: "Mensal" },
];

function phrase(a: ArticleCard) {
  const t = (a.excerpt || a.description || "").trim();
  if (!t) return "Novo artigo publicado na Monatiza.";
  return t.length > 130 ? t.slice(0, 130).trimEnd() + "…" : t;
}

function timeAgo(iso?: string | null) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `há ${Math.max(1, Math.floor(s / 60))} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  return `há ${Math.floor(s / 86400)} d`;
}

export default function NewsletterPage() {
  const [view, setView] = useState<"prefs" | "notif">("prefs");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cats, setCats] = useState<string[]>([]);
  const [freq, setFreq] = useState("semanal");

  const [articles, setArticles] = useState<ArticleCard[]>([]);
  const [loadingNotif, setLoadingNotif] = useState(true);
  const [notifOn, setNotifOn] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from("newsletter_subscriptions")
          .select("categories, frequency")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (data) {
          setCats(data.categories || []);
          setFreq(data.frequency || "semanal");
        }
      }
      setLoading(false);
    })();
  }, []);

  // Notificações: últimos artigos publicados + preferência local do aviso
  useEffect(() => {
    if (typeof window !== "undefined") setNotifOn(localStorage.getItem("newsletter_notif") !== "0");
    (async () => {
      const a = await fetchLatest(12);
      setArticles(a);
      setLoadingNotif(false);
    })();
  }, []);

  function toggleNotif() {
    setNotifOn((v) => {
      const n = !v;
      if (typeof window !== "undefined") localStorage.setItem("newsletter_notif", n ? "1" : "0");
      return n;
    });
  }

  function toggleCat(c: string) {
    setSaved(false);
    setCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  async function save() {
    setSaving(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from("newsletter_subscriptions").upsert(
      {
        user_id: session.user.id,
        categories: cats,
        frequency: freq,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    setSaving(false);
    setSaved(true);
  }

  if (loading) return <Spinner />;

  const TABS: { key: "prefs" | "notif"; label: string }[] = [
    { key: "prefs", label: "Preferências" },
    { key: "notif", label: "Notificações" },
  ];

  return (
    <div className="mx-auto max-w-[760px]">
      <PageHeader
        eyebrow={<><Mail size={14} /> Newsletter premium</>}
        title="Sua central de novidades"
        subtitle="Escolha os temas, a frequência e receba um aviso a cada novo artigo."
      />

      {/* abas */}
      <div className="mb-7 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            className={`rounded-full px-5 py-2 text-[13px] font-bold transition ${
              view === t.key ? "pro-gradient text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {view === "prefs" ? (
        <>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <h2 className="text-[12px] font-black uppercase tracking-widest text-zinc-400">Temas</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const on = cats.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleCat(c)}
                    className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                      on ? "pro-gradient text-white" : "pro-glass text-zinc-300"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            <h2 className="mt-8 text-[12px] font-black uppercase tracking-widest text-zinc-400">Frequência</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.key}
                  onClick={() => {
                    setSaved(false);
                    setFreq(f.key);
                  }}
                  className={`rounded-full px-5 py-2 text-[13px] font-semibold transition ${
                    freq === f.key ? "pro-gradient text-white" : "pro-glass text-zinc-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={save}
                disabled={saving}
                className="pro-gradient pro-glow inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Salvando…" : "Salvar preferências"}
              </button>
              {saved && (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-400">
                  <Check size={16} /> Preferências salvas
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* aviso de novos artigos */}
          <button
            onClick={toggleNotif}
            className="mb-6 flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:bg-white/[0.07]"
          >
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${notifOn ? "pro-gradient text-white" : "bg-white/10 text-zinc-400"}`}>
              {notifOn ? <Bell size={20} /> : <BellOff size={20} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-white">Avisar sobre novos artigos</span>
              <span className="block text-[13px] text-zinc-400">
                {notifOn ? "Ativado — você recebe um resumo a cada novo artigo." : "Desativado — toque para voltar a receber."}
              </span>
            </span>
            <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${notifOn ? "pro-gradient" : "bg-white/15"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${notifOn ? "left-[22px]" : "left-0.5"}`} />
            </span>
          </button>

          <h2 className="mb-3 text-[12px] font-black uppercase tracking-widest text-zinc-400">Últimos artigos</h2>
          {loadingNotif ? (
            <Spinner />
          ) : articles.length ? (
            <div className="space-y-2.5">
              {articles.map((a, i) => (
                <Link
                  key={a.id}
                  href={`/app/ler/${a.slug}`}
                  className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.07]"
                >
                  <span className="pro-gradient mt-1 h-2 w-2 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                      {a.category && <span className="pro-gradient-text">{a.category}</span>}
                      <span>· {timeAgo(a.created_at)}</span>
                      {i === 0 && <span className="rounded-full bg-[#E0263B]/15 px-2 py-0.5 text-[10px] text-[#ff6b7d]">novo</span>}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug text-zinc-100 group-hover:text-white">{a.title}</p>
                    <p className="mt-1 line-clamp-2 text-[13px] text-zinc-400">{phrase(a)}</p>
                  </div>
                  <ArrowRight size={16} className="mt-1 shrink-0 text-zinc-600 transition group-hover:text-[#c79bff]" />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={Mail} title="Sem artigos ainda" hint="Os novos artigos vão aparecer aqui para você conferir." />
          )}
        </>
      )}
    </div>
  );
}
