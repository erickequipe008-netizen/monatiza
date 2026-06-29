"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Check, IdCard, Camera, Upload, ArrowRight, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { uploadVerification } from "@/lib/premium/upload";
import { getMyProfile } from "@/lib/premium/community";
import VerifiedBadge from "@/components/premium/VerifiedBadge";
import { Spinner } from "@/components/premium/States";

// cartão flutuante / glass
const card =
  "rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.85)]";

function FileRow({
  label,
  icon: Icon,
  file,
  onPick,
}: {
  label: string;
  icon: typeof IdCard;
  file: File | null;
  onPick: (f: File) => void;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3.5">
      <span className={`flex h-10 w-10 items-center justify-center rounded-full ${file ? "pro-gradient text-white" : "bg-white/10 text-zinc-400"}`}>
        {file ? <Check size={18} /> : <Icon size={18} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-zinc-100">{label}</p>
        {file && <p className="truncate text-[12px] text-zinc-500">{file.name}</p>}
      </div>
      <button
        onClick={() => ref.current?.click()}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-[12px] font-semibold text-zinc-200 hover:bg-white/15"
      >
        <Upload size={13} /> {file ? "Trocar" : "Enviar"}
      </button>
      <input ref={ref} type="file" accept="image/*" capture="user" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); }} />
    </div>
  );
}

export default function VerificacaoPage() {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const paid = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("pago") === "1";

  useEffect(() => {
    (async () => {
      const prof = await getMyProfile();
      setVerified(!!prof?.verified);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from("verification_requests")
          .select("status")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setStatus(data?.status ?? null);
      }
      setLoading(false);
    })();
  }, []);

  // Etapa 1: pagar (cria o pedido e vai pro checkout)
  async function startPayment() {
    setBusy(true);
    setErr("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setBusy(false); return; }
    await supabase.from("verification_requests").upsert(
      { user_id: session.user.id, status: "pending", updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
    const res = await fetch("/api/checkout/verificacao", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const json = await res.json();
    if (json.url) window.location.href = json.url;
    else { setErr(json.error || "Não foi possível iniciar."); setBusy(false); }
  }

  // Etapa 2 (após pagar): enviar documento + selfie para análise
  async function submitDocs() {
    setErr("");
    if (!docFile || !selfieFile) { setErr("Envie o documento e a selfie."); return; }
    setBusy(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setBusy(false); return; }
    const [d, s] = await Promise.all([uploadVerification(docFile, "doc"), uploadVerification(selfieFile, "selfie")]);
    if (d.error || s.error || !d.path || !s.path) { setErr("Falha ao enviar."); setBusy(false); return; }
    await supabase.from("verification_requests").update({
      doc_url: d.path, selfie_url: s.path, status: "review", updated_at: new Date().toISOString(),
    }).eq("user_id", session.user.id);
    setStatus("review");
    setBusy(false);
  }

  if (loading) return <Spinner />;

  const showUpload = !verified && status !== "review" && (status === "paid" || paid);

  return (
    <div className="mx-auto max-w-[460px] pt-2">
      {verified ? (
        <div className={`${card} p-8 text-center`}>
          <div className="mx-auto mb-4 w-fit"><VerifiedBadge size={52} /></div>
          <h1 className="text-xl font-extrabold text-white">Você é verificado</h1>
          <p className="mt-2 text-sm text-zinc-400">O selo já aparece ao lado do seu nome.</p>
        </div>
      ) : status === "review" ? (
        <div className={`${card} p-8 text-center`}>
          <Loader2 className="mx-auto mb-3 animate-spin text-[#C9A24B]" size={26} />
          <h1 className="text-lg font-extrabold text-white">Em análise</h1>
          <p className="mt-2 text-sm text-zinc-400">Confirmamos sua identidade em até 48h.</p>
        </div>
      ) : showUpload ? (
        <div className={`${card} p-6`}>
          <div className="mb-5 flex items-center gap-3">
            <VerifiedBadge size={30} />
            <div>
              <h1 className="text-[17px] font-extrabold leading-tight text-white">Confirme sua identidade</h1>
              <p className="text-[12px] text-zinc-500">Pagamento confirmado · falta só verificar</p>
            </div>
          </div>
          <div className="space-y-2.5">
            <FileRow label="Documento com foto" icon={IdCard} file={docFile} onPick={setDocFile} />
            <FileRow label="Selfie" icon={Camera} file={selfieFile} onPick={setSelfieFile} />
          </div>
          {err && <p className="mt-3 text-sm text-red-300">{err}</p>}
          <button
            onClick={submitDocs}
            disabled={busy}
            className="pro-gradient mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : null}
            {busy ? "Enviando…" : "Enviar para análise"}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
            <Lock size={11} /> Envio privado e criptografado
          </p>
        </div>
      ) : (
        <div className={`${card} p-7 text-center`}>
          <div className="mx-auto mb-5 w-fit"><VerifiedBadge size={46} /></div>
          <h1 className="text-[20px] font-extrabold text-white">Selo de verificado</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm text-zinc-400">
            Ganhe o selo dourado ao lado do seu nome. Pagamento único.
          </p>
          {err && <p className="mt-4 text-sm text-red-300">{err}</p>}
          <button
            onClick={startPayment}
            disabled={busy}
            className="pro-gradient mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-[15px] font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : null}
            {busy ? "Abrindo…" : "Continuar · R$ 39,90"}
            {!busy && <ArrowRight size={16} />}
          </button>
        </div>
      )}
    </div>
  );
}
