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
  Sparkles,
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

const TOTAL = 5; // passos 0..4

export default function BoasVindasPage() {
  const [ready, setReady] = useState(false);
  const [next, setNext] = useState("/app");
  const [step, setStep] = useState(0);

  const [me, setMe] = useState<CommunityProfile | null>(null);
  const [people, setPeople] = useState<CommunityProfile[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // sessão + dados
  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("next");
    if (n) setNext(n);
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        window.location.replace("/painel/login?next=/painel/boas-vindas");
        return;
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08080b] p-4 text-white">
      <div className="pointer-events-none absolute -left-40 top-0 h-[460px] w-[560px] rounded-full bg-[#1d9bf0]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[460px] w-[560px] rounded-full bg-[#8b5cf6]/15 blur-[120px]" />

      <div className="pro-pop relative flex w-full max-w-[480px] flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        {/* barra de progresso + pular */}
        <div className="mb-6 flex items-center gap-4">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="pro-gradient h-full rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {canSkip ? (
            <button onClick={goNext} className="shrink-0 text-[13px] font-bold text-zinc-500 transition hover:text-white">
              Pular
            </button>
          ) : (
            <span className="shrink-0 text-[12px] font-semibold text-zinc-600">
              {step + 1}/{TOTAL}
            </span>
          )}
        </div>

        {/* conteúdo do passo (com motion) */}
        <div key={step} className="wave-in min-h-[340px]">
          {/* 0 — Boas-vindas */}
          {step === 0 && (
            <div className="flex flex-col items-center text-center">
              <span className="pro-gradient mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-[28px] font-black text-white shadow-lg">
                m
              </span>
              <h1 className="text-[26px] font-black leading-tight tracking-tight">
                {firstName ? `Bem-vindo, ${firstName}!` : "Bem-vindo à Monatiza!"}
              </h1>
              <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-zinc-400">
                Notícias, comunidade e conteúdos exclusivos num só lugar. Vamos deixar seu perfil pronto em poucos passos.
              </p>
              <div className="mt-7 w-full space-y-3 text-left">
                {[
                  { icon: Newspaper, t: "Notícias em tempo real", d: "Acompanhe análises e o que importa." },
                  { icon: MessagesSquare, t: "Comunidade e mensagens", d: "Converse e siga quem você curte." },
                  { icon: BookOpen, t: "Revistas e exclusivos", d: "Edições especiais para assinantes." },
                ].map((f) => (
                  <div key={f.t} className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1d9bf0]/15 text-[#1d9bf0]">
                      <f.icon size={19} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-white">{f.t}</p>
                      <p className="text-[12.5px] text-zinc-500">{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1 — Perfis sugeridos */}
          {step === 1 && (
            <div>
              <h2 className="text-[22px] font-black tracking-tight">Siga alguns perfis</h2>
              <p className="mt-1.5 text-[14px] text-zinc-400">Escolha quem acompanhar para turbinar seu feed.</p>
              <div className="mt-5 max-h-[300px] space-y-2 overflow-y-auto pr-1">
                {people.length === 0 && (
                  <p className="py-8 text-center text-[13px] text-zinc-500">Sem sugestões no momento — você descobre perfis depois no app.</p>
                )}
                {people.map((p) => {
                  const on = following.has(p.user_id);
                  return (
                    <div key={p.user_id} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-2.5">
                      <Avatar name={p.display_name || p.handle} url={p.avatar_url} size={44} />
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

          {/* 2 — Foto de perfil */}
          {step === 2 && (
            <div className="flex flex-col items-center text-center">
              <h2 className="text-[22px] font-black tracking-tight">Adicione uma foto</h2>
              <p className="mt-1.5 max-w-xs text-[14px] text-zinc-400">Ajuda a comunidade a te reconhecer.</p>
              <button
                onClick={() => fileRef.current?.click()}
                className="group relative mt-8 rounded-full"
                aria-label="Enviar foto de perfil"
              >
                <span className="pro-ring block rounded-full p-[3px]">
                  <span className="block overflow-hidden rounded-full border-4 border-[#08080b]">
                    <Avatar name={name || me?.handle || "?"} url={avatarUrl} size={128} />
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
                className="mt-6 rounded-full border border-white/12 px-5 py-2.5 text-[13.5px] font-bold text-white transition hover:bg-white/5"
              >
                {avatarUrl ? "Trocar foto" : "Escolher foto"}
              </button>
            </div>
          )}

          {/* 3 — Nome e descrição */}
          {step === 3 && (
            <div>
              <h2 className="text-[22px] font-black tracking-tight">Conte quem você é</h2>
              <p className="mt-1.5 text-[14px] text-zinc-400">Seu nome e uma breve descrição para o perfil.</p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-semibold text-zinc-400">Nome</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 50))}
                    placeholder="Seu nome"
                    className="h-13 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#1d9bf0] focus:ring-2 focus:ring-[#1d9bf0]/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-semibold text-zinc-400">Descrição</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 160))}
                    placeholder="Fale um pouco sobre você…"
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-[#1d9bf0] focus:ring-2 focus:ring-[#1d9bf0]/20"
                  />
                  <p className="mt-1 text-right text-[11px] text-zinc-600">{bio.length}/160</p>
                </div>
              </div>
            </div>
          )}

          {/* 4 — Concluído */}
          {step === 4 && (
            <div className="flex flex-col items-center py-6 text-center">
              <span className="pro-gradient mb-5 flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg">
                <Check size={40} strokeWidth={3} />
              </span>
              <h2 className="text-[24px] font-black tracking-tight">Tudo pronto!</h2>
              <p className="mt-3 max-w-xs text-[14.5px] leading-relaxed text-zinc-400">
                Seu perfil está no ar. Aproveite as notícias, a comunidade e os conteúdos da Monatiza.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#1d9bf0]/30 bg-[#1d9bf0]/10 px-4 py-2 text-[13px] font-bold text-[#1d9bf0]">
                <Sparkles size={15} /> Bem-vindo à comunidade
              </div>
            </div>
          )}
        </div>

        {/* navegação */}
        <div className="mt-7 flex items-center gap-3">
          {step > 0 && step < TOTAL - 1 && (
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="flex h-13 items-center justify-center gap-1.5 rounded-2xl border border-white/12 px-5 text-sm font-bold text-white transition hover:bg-white/5"
            >
              <ArrowLeft size={17} /> Voltar
            </button>
          )}
          <button
            onClick={goNext}
            disabled={saving}
            className="pro-gradient pro-glow flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {saving && <Loader2 size={17} className="animate-spin" />}
            {step === 0 && "Configurar meu perfil"}
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
