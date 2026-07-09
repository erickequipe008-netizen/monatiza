"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Check, Loader2, X } from "lucide-react";

type Purpose = "password" | "email";

interface PendingChange {
  purpose: Purpose;
  payload: { password?: string; email?: string };
  sentTo: string;
}

const cardCls = "bg-white border border-[#E8E6E1] rounded-2xl overflow-hidden";
const headCls = "px-5 py-3.5 border-b border-[#E8E6E1] bg-[#fafafa]";
const labelCls = "block text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-1.5";
const inputCls =
  "w-full rounded-xl border border-[#E8E6E1] bg-white px-3.5 py-2.5 text-sm text-[#0b0b0c] outline-none focus:border-[#0b0b0c] transition";
const btnCls =
  "inline-flex items-center gap-2 rounded-xl bg-[#0b0b0c] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#E0263B] transition disabled:opacity-40 disabled:cursor-not-allowed";

export default function PerfilColunista() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // modal do código de verificação por e-mail
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const meta = (user.user_metadata ?? {}) as { name?: string; display_name?: string };
      setName(meta.display_name || meta.name || "");
      setEmail(user.email || "");
      setLoading(false);
    })();
  }, []);

  function flash(msg: string) {
    setNotice(msg);
    setError("");
    setTimeout(() => setNotice(""), 5000);
  }

  async function saveName() {
    if (!name.trim()) return setError("Digite um nome.");
    setSaving("name");
    setError("");
    const { error: e } = await supabase.auth.updateUser({
      data: { name: name.trim(), display_name: name.trim() },
    });
    setSaving(null);
    if (e) return setError(e.message);
    flash("Nome de colunista atualizado.");
  }

  // envia o código de 6 dígitos para o e-mail atual e abre o modal
  async function requestChange(purpose: Purpose) {
    setError("");
    if (purpose === "email") {
      const em = newEmail.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) return setError("Digite um e-mail válido.");
    }
    if (purpose === "password" && newPassword.length < 6) {
      return setError("A nova senha deve ter no mínimo 6 caracteres.");
    }
    setSaving(purpose);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch("/api/account/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ purpose }),
    });
    const json = await res.json();
    setSaving(null);
    if (!res.ok) return setError(json.error || "Não foi possível enviar o código.");
    setCode("");
    setModalError("");
    setPending({
      purpose,
      payload: purpose === "password" ? { password: newPassword } : { email: newEmail.trim() },
      sentTo: json.sentTo || "seu e-mail",
    });
  }

  async function confirmCode() {
    if (!pending || code.length !== 6) return;
    setVerifying(true);
    setModalError("");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch("/api/account/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ purpose: pending.purpose, code, payload: pending.payload }),
    });
    const json = await res.json();
    setVerifying(false);
    if (!res.ok) return setModalError(json.error || "Não foi possível confirmar.");
    if (pending.purpose === "password") {
      setNewPassword("");
      flash("Senha alterada com sucesso.");
    } else {
      setEmail(pending.payload.email || email);
      setNewEmail("");
      flash("E-mail alterado com sucesso.");
    }
    setPending(null);
  }

  if (loading) return <div className="p-10 text-sm text-zinc-400">Carregando…</div>;

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-10 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-[#0b0b0c] mb-1">Perfil</h1>
        <p className="text-sm text-zinc-500">Gerencie seus dados de colunista e de acesso ao painel.</p>
      </div>

      {notice && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
          <Check size={15} /> {notice}
        </div>
      )}
      {error && <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* Nome */}
      <section className={cardCls}>
        <div className={headCls}>
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#0b0b0c]">Nome de colunista</span>
        </div>
        <div className="p-5 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className={labelCls} htmlFor="nome">
              Como sua assinatura aparece nas matérias
            </label>
            <input id="nome" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <button onClick={saveName} disabled={saving !== null} className={btnCls}>
            {saving === "name" && <Loader2 size={14} className="animate-spin" />} Salvar nome
          </button>
        </div>
      </section>

      {/* E-mail */}
      <section className={cardCls}>
        <div className={headCls}>
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#0b0b0c]">E-mail de acesso</span>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className={labelCls}>E-mail atual</label>
            <input className={`${inputCls} bg-[#F7F6F3] text-zinc-500`} value={email} readOnly />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className={labelCls} htmlFor="novo-email">
                Novo e-mail
              </label>
              <input
                id="novo-email"
                type="email"
                className={inputCls}
                placeholder="novo@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <button onClick={() => requestChange("email")} disabled={saving !== null || !newEmail} className={btnCls}>
              {saving === "email" && <Loader2 size={14} className="animate-spin" />} Alterar e-mail
            </button>
          </div>
          <p className="text-xs text-zinc-400">
            Por segurança, enviaremos um código de confirmação para o seu e-mail atual.
          </p>
        </div>
      </section>

      {/* Senha */}
      <section className={cardCls}>
        <div className={headCls}>
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#0b0b0c]">Senha</span>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className={labelCls} htmlFor="nova-senha">
                Nova senha
              </label>
              <input
                id="nova-senha"
                type="password"
                className={inputCls}
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button
              onClick={() => requestChange("password")}
              disabled={saving !== null || newPassword.length < 6}
              className={btnCls}
            >
              {saving === "password" && <Loader2 size={14} className="animate-spin" />} Alterar senha
            </button>
          </div>
          <p className="text-xs text-zinc-400">
            Por segurança, a troca de senha exige um código de confirmação enviado ao seu e-mail.
          </p>
        </div>
      </section>

      {/* Modal do código */}
      {pending && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="font-black text-[#0b0b0c]">Confirme com o código</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Enviamos um código de 6 dígitos para <b>{pending.sentTo}</b>. Ele expira em 10 minutos.
                </p>
              </div>
              <button
                onClick={() => setPending(null)}
                aria-label="Cancelar"
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-[#0b0b0c]"
              >
                <X size={16} />
              </button>
            </div>
            <input
              autoFocus
              inputMode="numeric"
              maxLength={6}
              className="w-full rounded-xl border border-[#E8E6E1] px-4 py-3 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-[#0b0b0c]"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            {modalError && <p className="mt-3 text-sm text-red-600">{modalError}</p>}
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                onClick={() => requestChange(pending.purpose)}
                className="text-xs font-semibold text-zinc-500 hover:text-[#0b0b0c]"
              >
                Reenviar código
              </button>
              <button onClick={confirmCode} disabled={code.length !== 6 || verifying} className={btnCls}>
                {verifying && <Loader2 size={14} className="animate-spin" />} Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
