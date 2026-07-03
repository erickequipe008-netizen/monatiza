"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  ShieldCheck,
  CreditCard,
  Settings2,
  LogOut,
  Trash2,
  Loader2,
  Save,
  X,
  KeyRound,
  ChevronRight,
  Crown,
} from "lucide-react";
import { useSubscriber } from "@/components/premium/SubscriberProvider";
import { supabase } from "@/lib/supabase/client";
import { getMyProfile, type CommunityProfile } from "@/lib/premium/community";
import { Avatar } from "@/components/premium/PostCard";

type SectionKey = "perfil" | "seguranca" | "assinaturas" | "conta";
type Purpose = "name" | "email" | "password";
type Pending = { purpose: Purpose; payload: { name?: string; email?: string; password?: string }; sentTo: string };

const SECTIONS: { key: SectionKey; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "perfil", label: "Perfil e dados pessoais", icon: User, desc: "Nome, foto e informações do perfil" },
  { key: "seguranca", label: "Senha e segurança", icon: ShieldCheck, desc: "E-mail, senha e verificação" },
  { key: "assinaturas", label: "Assinaturas e contas", icon: CreditCard, desc: "Plano, selo e cobrança" },
  { key: "conta", label: "Gerenciar conta", icon: Settings2, desc: "Encerrar sessão e excluir conta" },
];

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  active: { label: "Ativa", tone: "bg-emerald-500/15 text-emerald-400" },
  past_due: { label: "Pagamento pendente", tone: "bg-amber-500/15 text-amber-400" },
  canceled: { label: "Cancelada", tone: "bg-white/10 text-zinc-400" },
  inactive: { label: "Inativa", tone: "bg-amber-500/15 text-amber-400" },
};

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[14px] text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#1d9bf0]";
const labelCls = "mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-zinc-400";
const btnSolid =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-[13px] font-bold text-black transition hover:bg-white/90 disabled:opacity-50";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-[13px] font-bold text-zinc-100 transition hover:bg-white/5 disabled:opacity-50";

export default function ContaPage() {
  const { user, plan, status, periodEnd } = useSubscriber();
  const router = useRouter();

  const [section, setSection] = useState<SectionKey>("perfil");
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [pending, setPending] = useState<Pending | null>(null);
  const [code, setCode] = useState("");
  const [modalErr, setModalErr] = useState("");
  const [modalBusy, setModalBusy] = useState(false);

  useEffect(() => {
    getMyProfile().then((p) => {
      setProfile(p);
      setDisplayName(p?.display_name || "");
    });
  }, []);

  const info = STATUS_LABEL[status ?? "active"] ?? STATUS_LABEL.active;
  const name = profile?.display_name || user?.name || "Você";

  async function authFetch(url: string, body: unknown) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    return { res, json };
  }

  async function requestChange(purpose: Purpose, payload: Pending["payload"], validate?: () => string | null) {
    setMsg("");
    const v = validate?.();
    if (v) return setMsg(v);
    setBusy(true);
    const { res, json } = await authFetch("/api/account/send-code", { purpose });
    setBusy(false);
    if (!res.ok) return setMsg(json.error || "Não foi possível enviar o código.");
    setCode("");
    setModalErr("");
    setPending({ purpose, payload, sentTo: json.sentTo });
  }

  async function confirmCode() {
    if (!pending) return;
    setModalErr("");
    setModalBusy(true);
    const { res, json } = await authFetch("/api/account/verify-code", {
      purpose: pending.purpose,
      code: code.trim(),
      payload: pending.payload,
    });
    setModalBusy(false);
    if (!res.ok) return setModalErr(json.error || "Código incorreto.");
    if (pending.purpose === "name") setDisplayName(pending.payload.name || "");
    if (pending.purpose === "email") setNewEmail("");
    if (pending.purpose === "password") setNewPassword("");
    const done = pending.purpose;
    setPending(null);
    setMsg(done === "email" ? "E-mail atualizado com sucesso." : done === "password" ? "Senha atualizada com sucesso." : "Nome atualizado com sucesso.");
  }

  async function openPortal() {
    setPortalLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push("/painel/login");
    const res = await fetch("/api/stripe/portal", { method: "POST", headers: { Authorization: `Bearer ${session.access_token}` } });
    const json = await res.json();
    if (json.url) window.location.href = json.url;
    else { alert(json.error || "Não foi possível abrir o portal de cobrança."); setPortalLoading(false); }
  }

  async function deleteAccount() {
    if (!confirm("Tem certeza que deseja EXCLUIR sua conta? Esta ação é permanente e apaga seu perfil e publicações.")) return;
    if (!confirm("Confirmação final: excluir a conta agora? Não dá para desfazer.")) return;
    setDeleting(true);
    const { res, json } = await authFetch("/api/account/delete", {});
    if (!res.ok) { setDeleting(false); return alert(json.error || "Não foi possível excluir a conta."); }
    await supabase.auth.signOut();
    router.push("/");
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-[940px]">
      <h1 className="text-[26px] font-extrabold tracking-tight">Central da conta</h1>
      <p className="mb-6 text-[14px] text-zinc-500">Gerencie seu perfil, login, segurança e assinaturas.</p>

      {msg && <p className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-zinc-200">{msg}</p>}

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        {/* NAV DAS ABAS (estilo Central de Contas) */}
        <nav className="space-y-1">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = section === s.key;
            return (
              <button
                key={s.key}
                onClick={() => { setSection(s.key); setMsg(""); }}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${active ? "bg-white/10" : "hover:bg-white/5"}`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${active ? "bg-white text-black" : "bg-white/5 text-zinc-300"}`}>
                  <Icon size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-bold text-white">{s.label}</span>
                  <span className="block truncate text-[12px] text-zinc-500">{s.desc}</span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-zinc-600" />
              </button>
            );
          })}
        </nav>

        {/* PAINEL */}
        <div className="min-w-0">
          {section === "perfil" && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 p-4">
                <Avatar name={name} url={profile?.avatar_url} size={56} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-extrabold text-white">{name}</p>
                  {profile?.handle && <p className="truncate text-[13px] text-zinc-500">@{profile.handle}</p>}
                </div>
                <Link href="/app/perfil" className={btnGhost}>Editar perfil</Link>
              </div>

              <div className="rounded-2xl border border-white/10 p-5 md:p-6">
                <h2 className="mb-4 text-[16px] font-extrabold text-white">Nome de perfil</h2>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input value={displayName} maxLength={40} onChange={(e) => setDisplayName(e.target.value)} className={inputCls} placeholder="Seu nome" />
                  <button
                    onClick={() => requestChange("name", { name: displayName.trim() }, () => (!displayName.trim() ? "Digite um nome." : null))}
                    disabled={busy}
                    className={btnSolid}
                  >
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar
                  </button>
                </div>
                <p className="mt-2 text-[12px] text-zinc-500">Enviaremos um código ao seu e-mail para confirmar a alteração.</p>
              </div>
            </div>
          )}

          {section === "seguranca" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 p-5 md:p-6">
                <h2 className="mb-1 text-[16px] font-extrabold text-white">Verificação em duas etapas</h2>
                <p className="mb-4 flex items-start gap-2 text-[13px] leading-relaxed text-zinc-400">
                  <ShieldCheck size={16} className="mt-[1px] shrink-0 text-emerald-400" />
                  Ativa. Toda alteração de e-mail ou senha exige um código de 6 dígitos enviado ao seu e-mail.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 p-5 md:p-6">
                <h2 className="mb-4 text-[16px] font-extrabold text-white">Login</h2>

                <label className={labelCls}>E-mail atual</label>
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-[14px] text-zinc-400">
                  <Mail size={15} /> {user?.email}
                </div>

                <label className={labelCls}>Trocar e-mail</label>
                <div className="mb-5 flex flex-col gap-2 sm:flex-row">
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="novo@email.com" className={inputCls} />
                  <button
                    onClick={() => requestChange("email", { email: newEmail.trim() }, () => (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmail.trim()) ? "Digite um e-mail válido." : null))}
                    disabled={busy}
                    className={`${btnGhost} shrink-0`}
                  >
                    Atualizar
                  </button>
                </div>

                <label className={labelCls}>Trocar senha</label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova senha (mín. 6)" className={inputCls} />
                  <button
                    onClick={() => requestChange("password", { password: newPassword }, () => (newPassword.length < 6 ? "A senha deve ter no mínimo 6 caracteres." : null))}
                    disabled={busy}
                    className={`${btnGhost} shrink-0`}
                  >
                    Atualizar
                  </button>
                </div>
              </div>
            </div>
          )}

          {section === "assinaturas" && (
            <div className="rounded-2xl border border-white/10 p-5 md:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-[16px] font-extrabold text-white"><Crown size={17} className="text-zinc-400" /> Assinaturas e contas</h2>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${info.tone}`}>{info.label}</span>
                <span className="text-[13px] capitalize text-zinc-400">Plano {plan || "grátis"}</span>
                {profile?.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#1d9bf0]/15 px-3 py-1 text-[12px] font-bold text-[#1d9bf0]">
                    <ShieldCheck size={13} /> Verificado{profile.verified_tier === "silver" ? " · Prata" : profile.verified_tier === "gold" ? " · Ouro" : ""}
                  </span>
                )}
              </div>
              {periodEnd && <p className="mt-3 text-[13px] text-zinc-500">Renova em {new Date(periodEnd).toLocaleDateString("pt-BR")}</p>}
              <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={openPortal} disabled={portalLoading} className={btnGhost}>
                  <CreditCard size={15} /> {portalLoading ? "Abrindo…" : "Gerenciar cobrança"}
                </button>
                {!profile?.verified && (
                  <Link href="/app/verificacao" className={btnGhost}><ShieldCheck size={15} /> Obter selo de verificação</Link>
                )}
              </div>
            </div>
          )}

          {section === "conta" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 p-5 md:p-6">
                <h2 className="mb-2 text-[16px] font-extrabold text-white">Sessão</h2>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[13px] text-zinc-400">Encerra a sessão neste dispositivo.</p>
                  <button onClick={logout} className={btnGhost}><LogOut size={15} /> Sair</button>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E0263B]/30 p-5 md:p-6">
                <h2 className="mb-2 flex items-center gap-2 text-[16px] font-extrabold text-[#E0263B]"><Trash2 size={17} /> Excluir conta</h2>
                <p className="mb-4 text-[13px] leading-relaxed text-zinc-400">Apaga permanentemente o seu perfil, publicações e dados. Esta ação não pode ser desfeita.</p>
                <button onClick={deleteAccount} disabled={deleting} className="inline-flex items-center gap-2 rounded-full bg-[#E0263B] px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#c01f31] disabled:opacity-50">
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} {deleting ? "Excluindo…" : "Excluir minha conta"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE CÓDIGO DE VERIFICAÇÃO */}
      {pending && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setPending(null)}>
          <div className="pro-pop w-full max-w-[400px] rounded-3xl border border-white/10 bg-[#16181c] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2 text-[15px] font-extrabold text-white"><KeyRound size={17} className="text-[#1d9bf0]" /> Verificação de segurança</span>
              <button onClick={() => setPending(null)} className="rounded-full p-1 text-zinc-400 hover:bg-white/10 hover:text-white"><X size={18} /></button>
            </div>
            <p className="text-[13px] leading-relaxed text-zinc-400">
              Enviamos um código de 6 dígitos para <b className="text-zinc-200">{pending.sentTo}</b>. Digite-o abaixo para confirmar.
            </p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              placeholder="______"
              className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-[24px] font-bold tracking-[0.5em] text-white outline-none focus:border-[#1d9bf0]"
              autoFocus
            />
            {modalErr && <p className="mt-2 text-[13px] font-semibold text-[#E0263B]">{modalErr}</p>}
            <button onClick={confirmCode} disabled={modalBusy || code.length < 6} className={`${btnSolid} mt-4 w-full py-3`}>
              {modalBusy ? <Loader2 size={15} className="animate-spin" /> : null} Confirmar
            </button>
            <button onClick={() => requestChange(pending.purpose, pending.payload)} className="mt-3 w-full text-center text-[13px] font-bold text-[#1d9bf0]">
              Reenviar código
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
