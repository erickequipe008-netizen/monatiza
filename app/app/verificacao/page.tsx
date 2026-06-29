"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck, Loader2, Check, IdCard, Camera, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { uploadVerification } from "@/lib/premium/upload";
import { getMyProfile } from "@/lib/premium/community";
import VerifiedBadge from "@/components/premium/VerifiedBadge";
import { Spinner, PageHeader } from "@/components/premium/States";

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
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <span className={`flex h-11 w-11 items-center justify-center rounded-full ${file ? "pro-gradient text-white" : "bg-white/10 text-zinc-400"}`}>
        {file ? <Check size={20} /> : <Icon size={20} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold text-zinc-100">{label}</p>
        <p className="truncate text-[12px] text-zinc-500">{file ? file.name : "Nenhum arquivo enviado"}</p>
      </div>
      <button
        onClick={() => ref.current?.click()}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-[12px] font-bold text-zinc-200 hover:border-white/30"
      >
        <Upload size={13} /> {file ? "Trocar" : "Enviar"}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
      />
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
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

  async function submit() {
    setErr("");
    if (!docFile || !selfieFile) {
      setErr("Envie a foto do documento e a selfie para continuar.");
      return;
    }
    setBusy(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setBusy(false);
      return;
    }
    const [d, s] = await Promise.all([
      uploadVerification(docFile, "doc"),
      uploadVerification(selfieFile, "selfie"),
    ]);
    if (d.error || s.error || !d.path || !s.path) {
      setErr("Falha ao enviar as imagens. Tente novamente.");
      setBusy(false);
      return;
    }
    await supabase.from("verification_requests").upsert(
      {
        user_id: session.user.id,
        doc_url: d.path,
        selfie_url: s.path,
        status: "pending",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    const res = await fetch("/api/checkout/verificacao", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const json = await res.json();
    if (json.url) {
      window.location.href = json.url;
    } else {
      setErr(json.error || "Não foi possível iniciar o pagamento.");
      setBusy(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-[560px]">
      <PageHeader
        eyebrow={<><ShieldCheck size={14} /> Verificação</>}
        title="Selo de verificado"
        subtitle="Confirme sua identidade e ganhe o selo dourado ao lado do seu nome."
      />

      {verified ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <div className="mx-auto mb-4 w-fit">
            <VerifiedBadge size={56} />
          </div>
          <h2 className="text-xl font-extrabold text-white">Você é verificado!</h2>
          <p className="mt-2 text-sm text-zinc-400">O selo dourado já aparece ao lado do seu nome em toda a Monatiza.</p>
        </div>
      ) : paid || status === "paid" ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <Loader2 className="mx-auto mb-3 animate-spin text-[#C9A24B]" size={28} />
          <h2 className="text-lg font-extrabold text-white">Pagamento recebido — em análise</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Nossa equipe está conferindo seus documentos. Você recebe o selo em até 48h.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#C9A24B]/30 bg-[#C9A24B]/10 p-4">
            <VerifiedBadge size={34} />
            <div>
              <p className="text-[14px] font-bold text-zinc-100">Selo dourado por R$ 39,90</p>
              <p className="text-[12px] text-zinc-400">Pagamento único · igual ao Instagram</p>
            </div>
          </div>

          <p className="mb-3 text-[12px] font-black uppercase tracking-widest text-zinc-500">
            Verificação em 2 etapas
          </p>
          <div className="space-y-3">
            <FileRow label="1. Documento com foto (RG/CNH)" icon={IdCard} file={docFile} onPick={setDocFile} />
            <FileRow label="2. Selfie (reconhecimento facial)" icon={Camera} file={selfieFile} onPick={setSelfieFile} />
          </div>

          <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-zinc-500">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#C9A24B]" />
            Seus documentos são enviados de forma <b className="text-zinc-300">privada e criptografada</b>, usados só para conferir sua identidade, e nunca aparecem publicamente.
          </p>

          {err && <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{err}</p>}

          <button
            onClick={submit}
            disabled={busy}
            className="pro-gradient mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {busy ? "Enviando…" : "Pagar R$ 39,90 e enviar"}
          </button>
          <p className="mt-2 text-center text-[11px] text-zinc-500">Pagamento seguro processado pelo Stripe.</p>
        </>
      )}
    </div>
  );
}
