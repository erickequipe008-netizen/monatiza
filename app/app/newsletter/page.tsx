"use client";

import { useEffect, useState } from "react";
import { Mail, Check } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
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

export default function NewsletterPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cats, setCats] = useState<string[]>([]);
  const [freq, setFreq] = useState("semanal");

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return setLoading(false);
      const { data } = await supabase
        .from("newsletter_subscriptions")
        .select("categories, frequency")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (data) {
        setCats(data.categories || []);
        setFreq(data.frequency || "semanal");
      }
      setLoading(false);
    })();
  }, []);

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

  return (
    <div className="mx-auto max-w-[760px]">
      <PageHeader
        eyebrow={<><Mail size={14} /> Newsletter premium</>}
        title="Suas preferências"
        subtitle="Escolha os temas e a frequência. Enviamos as melhores pautas direto no seu e-mail."
      />

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 md:p-8">
        <h2 className="text-[12px] font-black uppercase tracking-widest text-zinc-400">Temas</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const on = cats.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggleCat(c)}
                className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
                  on
                    ? "border-[#E0263B] bg-[#E0263B] text-white"
                    : "border-zinc-300 text-zinc-600 hover:border-zinc-500"
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
              className={`rounded-full border px-5 py-2 text-[13px] font-semibold transition ${
                freq === f.key
                  ? "border-[#0b0b0c] bg-[#0b0b0c] text-white"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-500"
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
            className="inline-flex items-center gap-2 rounded-xl bg-[#0b0b0c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#E0263B] disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar preferências"}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600">
              <Check size={16} /> Preferências salvas
            </span>
          )}
        </div>
      </div>

      <h2 className="mt-12 mb-4 text-[13px] font-black uppercase tracking-[0.18em] text-zinc-900">
        Edições anteriores
      </h2>
      <EmptyState icon={Mail} title="Em breve" hint="As edições enviadas vão aparecer aqui para releitura." />
    </div>
  );
}
