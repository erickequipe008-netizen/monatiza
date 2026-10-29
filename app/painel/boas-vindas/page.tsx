"use client";

import { useEffect, useRef, useState } from "react";
import {
  Newspaper,
  MessagesSquare,
  BookOpen,
  Camera,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import {
  ensureProfile,
  getRecommendedProfiles,
  follow,
  unfollow,
  updateProfile,
  type CommunityProfile,
} from "@/lib/premium/community";
import { uploadMedia } from "@/lib/premium/upload";
import { Avatar } from "@/components/premium/PostCard";
import VerifiedBadge from "@/components/premium/VerifiedBadge";

const TOTAL = 6; // 0..5
const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const NOW = new Date();
const YEARS = Array.from({ length: 100 }, (_, i) => NOW.getFullYear() - 13 - i);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const selectCls =
  "peer h-13 w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.03] px-4 pr-9 text-sm font-medium text-white outline-none transition focus:border-[#1d9bf0]/60 focus:bg-white/[0.05]";

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative block">
      <span className="mb-1.5 block text-[11.5px] font-semibold text-zinc-500">{label}</span>
      <span className="relative block">
        <select value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
          {children}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" />
      </span>
    </label>
  );
}

export default function BoasVindasPage() {
  const [ready, setReady] = useState(false);
  const [next, setNext] = useState("/app");
  const [step, setStep] = useState(0);

  const [me, setMe] = useState<CommunityProfile | null>(null);
  const [people, setPeople] = useState<CommunityProfile[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  const [bDay, setBDay] = useState("");
  const [bMonth, setBMonth] = useState("");
  const [bYear, setBYear] = useState("");

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("next");
    if (n) setNext(n);
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.replace("/painel/login?next=/painel/boas-vindas");
        return;
      }
      const bd = data.session.user.user_metadata?.birthdate as string | undefined;
      if (bd) {
        const [y, m, d] = bd.split("-");
        if (y && m && d) {
          setBYear(y);
          setBMonth(String(parseInt(m, 10) - 1));
          setBDay(String(parseInt(d, 10)));
        }
      }
      const [prof, ppl] = await Promise.all([ensureProfile(), getRecommendedProfiles(12)]);
      if (prof) {
        setMe(prof);
        setName(prof.display_name || "");
        setBio(prof.bio || "");
        setAvatarUrl(prof.avatar_url || "");
      }
      setPeople(ppl);
      setReady(true);
    })();
  }, []);

  const firstName = (name || me?.display_name || "").split(" ")[0];

  async function toggleFollow(uid: string) {
    const on = following.has(uid);
    setFollowing((prev) => {
      const nx = new Set(prev);
      if (on) nx.delete(uid);
      else nx.add(uid);
      return nx;
    });
    if (on) await unfollow(uid);
    else await follow(uid);
  }

  async function onPickFile(f: File) {
    if (!f.type.startsWith("image/")) return;
    setUploading(true);
    const { url } = await uploadMedia(f, "avatars");
    if (url) setAvatarUrl(url);
    setUploading(false);
  }

  async function finish() {
    setSaving(true);
    if (bDay && bMonth !== "" && bYear) {
      const birthdate = `${bYear}-${String(Number(bMonth) + 1).padStart(2, "0")}-${String(bDay).padStart(2, "0")}`;
      try {
        await supabase.auth.updateUser({ data: { birthdate } });
      } catch {}
    }
    await updateProfile({
      display_name: name.trim() || me?.display_name || undefined,
      bio: bio.trim() ? bio.trim() : null,
      avatar_url: avatarUrl || undefined,
    });
    window.location.replace(next);
  }

  function goNext() {
    if (step < TOTAL - 1) setStep((s) => s + 1);
    else finish();
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08080b] text-zinc-500">
        <Loader2 size={24} className="animate-spin text-[#1d9bf0]" />
      </main>
    );
  }

  const progress = ((step + 1) / TOTAL) * 100;
  const canSkip = step > 0 && step < TOTAL - 1;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08080b] px-4 py-8 text-white">
      <div className="pointer-events-none absolute left-1/2 top-[-10%] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-[#1d9bf0]/12 blur-[140px]" />

      <div className="relative w-full max-w-[440px]">
        {/* topo: progresso */}
        <div className="mb-8 flex items-center gap-4">
          <span className="text-[12px] font-bold tabular-nums text-zinc-500">
            {String(step + 1).padStart(2, "0")}
            <span className="text-zinc-700"> / {String(TOTAL).padStart(2, "0")}</span>
          </span>
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="pro-gradient h-full rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {canSkip && (
            <button onClick={goNext} className="text-[13px] font-semibold text-zinc-500 transition hover:text-white">
              Pular
            </button>
          )}
        </div>

        {/* conteúdo */}
        <div key={step} className="wave-in flex min-h-[380px] flex-col">
          {/* 0 — Boas-vindas */}
          {step === 0 && (
            <div className="flex flex-1 flex-col items-center text-center">
              <span className="pro-gradient mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-[26px] font-black text-white shadow-[0_10px_30px_-8px_rgba(29,155,240,0.6)]">
                m
              </span>
              <h1 className="text-[27px] font-black leading-[1.1] tracking-tight">
                {firstName ? `Bem-vindo, ${firstName}` : "Bem-vindo à Monatiza"}
              </h1>
              <p className="mt-3 max-w-[19rem] text-[14.5px] leading-relaxed text-zinc-400">
                Vamos deixar seu perfil pronto em poucos passos.
              </p>
              <div className="mt-9 w-full space-y-5">
                {[
                  { icon: Newspaper, t: "Notícias em tempo real", d: "Análises e o que importa, na hora." },
                  { icon: MessagesSquare, t: "Comunidade e mensagens", d: "Converse e siga quem você curte." },
                  { icon: BookOpen, t: "Revistas e exclusivos", d: "Edições especiais para assinantes." },
                ].map((f) => (
                  <div key={f.t} className="flex items-center gap-4 text-left">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1d9bf0]/12 text-[#1d9bf0]">
                      <f.icon size={19} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14.5px] font-bold text-white">{f.t}</p>
                      <p className="text-[12.5px] text-zinc-500">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1 — Data de nascimento */}
          {step === 1 && (
            <div className="flex flex-1 flex-col">
              <h2 className="text-[24px] font-black tracking-tight">Sua data de nascimento</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">
                Não será exibida publicamente. Usamos para personalizar sua experiência.
              </p>
              <div className="mt-9 grid grid-cols-[1fr_1.4fr_1fr] gap-3">
                <Select label="Dia" value={bDay} onChange={setBDay}>
                  <option value="">—</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d} className="bg-[#15151b]">{d}</option>
                  ))}
                </Select>
                <Select label="Mês" value={bMonth} onChange={setBMonth}>
                  <option value="">—</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i} className="bg-[#15151b] capitalize">{m}</option>
                  ))}
                </Select>
                <Select label="Ano" value={bYear} onChange={setBYear}>
                  <option value="">—</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y} className="bg-[#15151b]">{y}</option>
                  ))}
                </Select>
              </div>
            </div>
          )}

          {/* 2 — Perfis sugeridos */}
          {step === 2 && (
            <div className="flex flex-1 flex-col">
              <h2 className="text-[24px] font-black tracking-tight">Siga alguns perfis</h2>
              <p className="mt-2 text-[14px] text-zinc-400">Escolha quem acompanhar para começar seu feed.</p>
              <div className="pro-scroll mt-6 flex-1 space-y-1 overflow-y-auto pr-1">
                {people.length === 0 && (
                  <p className="py-10 text-center text-[13px] text-zinc-500">Você descobre perfis depois, no app.</p>
                )}
                {people.map((p) => {
                  const on = following.has(p.user_id);
                  return (
                    <div key={p.user_id} className="flex items-center gap-3 rounded-2xl py-2 pl-1 pr-1 transition hover:bg-white/[0.03]">
                      <Avatar name={p.display_name || p.handle} url={p.avatar_url} size={42} />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1 truncate text-[14px] font-bold text-white">
                          {p.display_name || p.handle}
                          {p.verified && <VerifiedBadge size={13} />}
                        </p>
                        <p className="truncate text-[12.5px] text-zinc-500">@{p.handle}</p>
                      </div>
                      <button
                        onClick={() => toggleFollow(p.user_id)}
                        className={`shrink-0 rounded-full px-4 py-1.5 text-[12.5px] font-bold transition ${
                          on ? "border border-white/15 text-zinc-300" : "bg-white text-black hover:bg-white/90"
                        }`}
                      >
                        {on ? "Seguindo" : "Seguir"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3 — Foto de perfil */}
          {step === 3 && (
            <div className="flex flex-1 flex-col items-center text-center">
              <h2 className="text-[24px] font-black tracking-tight">Adicione uma foto</h2>
              <p className="mt-2 max-w-[17rem] text-[14px] text-zinc-400">Ajuda a comunidade a te reconhecer.</p>
              <button onClick={() => fileRef.current?.click()} className="group relative mt-10" aria-label="Enviar foto de perfil">
                <span className="pro-ring block rounded-full p-[3px]">
                  <span className="block overflow-hidden rounded-full border-4 border-[#08080b]">
                    <Avatar name={name || me?.handle || "?"} url={avatarUrl} size={132} />
                  </span>
                </span>
                <span className="pro-gradient absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-[#08080b]">
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                </span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onPickFile(f);
                }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-7 rounded-full border border-white/12 px-6 py-2.5 text-[13.5px] font-bold text-white transition hover:bg-white/5"
              >
                {avatarUrl ? "Trocar foto" : "Escolher foto"}
              </button>
            </div>
          )}

          {/* 4 — Nome e descrição */}
          {step === 4 && (
            <div className="flex flex-1 flex-col">
              <h2 className="text-[24px] font-black tracking-tight">Conte quem você é</h2>
              <p className="mt-2 text-[14px] text-zinc-400">Seu nome e uma breve descrição.</p>
              <div className="mt-8 space-y-5">
                <label className="block">
                  <span className="mb-1.5 block text-[11.5px] font-semibold text-zinc-500">Nome</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 50))}
                    placeholder="Seu nome"
                    className="h-13 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-[#1d9bf0]/60 focus:bg-white/[0.05]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11.5px] font-semibold text-zinc-500">Descrição</span>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 160))}
                    placeholder="Fale um pouco sobre você…"
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-[#1d9bf0]/60 focus:bg-white/[0.05]"
                  />
                  <p className="mt-1 text-right text-[11px] text-zinc-600">{bio.length}/160</p>
                </label>
              </div>
            </div>
          )}

          {/* 5 — Concluído */}
          {step === 5 && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <span className="pro-gradient mb-6 flex h-20 w-20 items-center justify-center rounded-full text-white shadow-[0_16px_40px_-10px_rgba(29,155,240,0.7)]">
                <Check size={40} strokeWidth={3} />
              </span>
              <h2 className="text-[26px] font-black tracking-tight">Tudo pronto</h2>
              <p className="mt-3 max-w-[18rem] text-[14.5px] leading-relaxed text-zinc-400">
                Seu perfil está no ar. Aproveite as notícias, a comunidade e os conteúdos da Monatiza.
              </p>
            </div>
          )}
        </div>

        {/* navegação */}
        <div className="mt-8 flex items-center gap-3">
          {step > 0 && step < TOTAL - 1 && (
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-white/12 text-white transition hover:bg-white/5"
              aria-label="Voltar"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <button
            onClick={goNext}
            disabled={saving}
            className="pro-gradient pro-glow flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {saving && <Loader2 size={17} className="animate-spin" />}
            {step === 0 && "Começar"}
            {step > 0 && step < TOTAL - 1 && (
              <>
                Continuar <ArrowRight size={17} />
              </>
            )}
            {step === TOTAL - 1 && (saving ? "Entrando…" : "Ir para o app")}
          </button>
        </div>
      </div>
    </main>
  );
}
