"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  CreditCard,
  LogOut,
  Trash2,
  ShieldCheck,
  Loader2,
  Save,
  Crown,
} from "lucide-react";
import { useSubscriber } from "@/components/premium/SubscriberProvider";
import { supabase } from "@/lib/supabase/client";
import { getMyProfile, updateProfile, type CommunityProfile } from "@/lib/premium/community";
import { PageHeader } from "@/components/premium/States";

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  active: { label: "Ativa", tone: "bg-emerald-500/15 text-emerald-400" },
  past_due: { label: "Pagamento pendente", tone: "bg-amber-500/15 text-amber-400" },
  canceled: { label: "Cancelada", tone: "bg-white/10 text-zinc-400" },
  inactive: { label: "Inativa", tone: "bg-amber-500/15 text-amber-400" },
};

function Card({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 p-5 md:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-[15px] font-extrabold text-white">
        <Icon size={17} className="text-zinc-400" /> {title}
      </h2>
      {children}
    </section>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[14px] text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#1d9bf0]";
const labelCls = "mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-zinc-400";
const btnCls =
  "inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-black transition hover:bg-white/90 disabled:opacity-50";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-[13px] font-bold text-zinc-100 transition hover:bg-white/5 disabled:opacity-50";

export default function ContaPage() {
  const { user, plan, status, periodEnd } = useSubscriber();
  const router = useRouter();

  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getMyProfile().then((p) => {
      setProfile(p);
      setDisplayName(p?.display_name || "");
    });
  }, []);

  const info = STATUS_LABEL[status ?? "active"] ?? STATUS_LABEL.active;

  async function saveName() {
    setMsg("");
    setSavingName(true);
    const { error } = await updateProfile({ display_name: displayName.trim() || null });
    await supabase.auth.updateUser({ data: { name: displayName.trim() } });
    setSavingName(false);
    setMsg(error ? `Erro: ${error}` : "Nome atualizado.");
  }

  async function changeEmail() {
    setMsg("");
    if (!newEmail.trim()) return setMsg("Digite o novo e-mail.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setBusy(false);
    if (error) return setMsg("Erro: " + error.message);
    setNewEmail("");
    setMsg("Enviamos um link de confirmação para o novo e-mail. A troca vale após confirmar.");
  }

  async function changePassword() {
    setMsg("");
    if (newPassword.length < 6) return setMsg("A senha deve ter no mínimo 6 caracteres.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setBusy(false);
    if (error) return setMsg("Erro: " + error.message);
    setNewPassword("");
    setMsg("Senha atualizada com sucesso.");
  }

  async function openPortal() {
    setPortalLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/painel/login");
      return;
    }
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const json = await res.json();
    if (json.url) window.location.href = json.url;
    else {
      alert(json.error || "Não foi possível abrir o portal de cobrança.");
      setPortalLoading(false);
    }
  }

  async function deleteAccount() {
    if (!confirm("Tem certeza que deseja EXCLUIR sua conta? Esta ação é permanente e apaga seu perfil e publicações.")) return;
    if (!confirm("Confirmação final: excluir a conta agora? Não dá para desfazer.")) return;
    setDeleting(true);
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/account/delete", {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    const json = await res.json();
    if (!res.ok) {
      setDeleting(false);
      alert(json.error || "Não foi possível excluir a conta.");
      return;
    }
    await supabase.auth.signOut();
    router.push("/");
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-[680px]">
      <PageHeader eyebrow={<><User size={14} /> Conta</>} title="Configurações" subtitle="Seu perfil, login, assinatura e acesso." />

      {msg && (
        <p className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-zinc-200">{msg}</p>
      )}

      <div className="space-y-5">
        {/* PERFIL */}
        <Card title="Perfil" icon={User}>
          <label className={labelCls}>Nome de perfil</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input value={displayName} maxLength={40} onChange={(e) => setDisplayName(e.target.value)} className={inputCls} placeholder="Seu nome" />
            <button onClick={saveName} disabled={savingName} className={`${btnCls} shrink-0`}>
              {savingName ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar
            </button>
          </div>
          {profile?.handle && <p className="mt-2 text-[13px] text-zinc-500">@{profile.handle}</p>}
          <Link href="/app/perfil" className="mt-3 inline-block text-[13px] font-bold text-[#1d9bf0] hover:underline">
            Editar perfil completo (foto, capa, bio, link)
          </Link>
        </Card>

        {/* LOGIN E SENHA */}
        <Card title="Login e senha" icon={Lock}>
          <label className={labelCls}>E-mail atual</label>
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-[14px] text-zinc-400">
            <Mail size={15} /> {user?.email}
          </div>

          <label className={labelCls}>Trocar e-mail</label>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="novo@email.com" className={inputCls} />
            <button onClick={changeEmail} disabled={busy} className={`${btnGhost} shrink-0`}>Atualizar</button>
          </div>

          <label className={labelCls}>Trocar senha</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova senha (mín. 6)" className={inputCls} />
            <button onClick={changePassword} disabled={busy} className={`${btnGhost} shrink-0`}>Atualizar</button>
          </div>
        </Card>

        {/* ASSINATURA */}
        <Card title="Assinatura" icon={Crown}>
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
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={openPortal} disabled={portalLoading} className={btnGhost}>
              <CreditCard size={15} /> {portalLoading ? "Abrindo…" : "Gerenciar cobrança"}
            </button>
            {!profile?.verified && (
              <Link href="/app/verificacao" className={btnGhost}>
                <ShieldCheck size={15} /> Obter selo de verificação
              </Link>
            )}
          </div>
        </Card>

        {/* SAIR */}
        <Card title="Sessão" icon={LogOut}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-zinc-400">Encerra a sessão neste dispositivo.</p>
            <button onClick={logout} className={btnGhost}><LogOut size={15} /> Sair</button>
          </div>
        </Card>

        {/* EXCLUIR CONTA */}
        <section className="rounded-2xl border border-[#E0263B]/30 p-5 md:p-6">
          <h2 className="mb-2 flex items-center gap-2 text-[15px] font-extrabold text-[#E0263B]">
            <Trash2 size={17} /> Excluir conta
          </h2>
          <p className="mb-4 text-[13px] leading-relaxed text-zinc-400">
            Apaga permanentemente o seu perfil, publicações e dados. Esta ação não pode ser desfeita.
          </p>
          <button
            onClick={deleteAccount}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-full bg-[#E0263B] px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#c01f31] disabled:opacity-50"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {deleting ? "Excluindo…" : "Excluir minha conta"}
          </button>
        </section>
      </div>
    </div>
  );
}
