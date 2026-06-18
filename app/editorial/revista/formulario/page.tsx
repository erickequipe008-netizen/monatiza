"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import type { FormEvent, ReactNode } from "react";

type FormState = {
  nome_empresa: string;
  cargo: string;
  biografia: string;
  instagram: string;
  linkedin: string;
  whatsapp: string;
  site: string;
  tema_materia: string;
  observacoes: string;
};

const INITIAL_FORM: FormState = {
  nome_empresa: "",
  cargo: "",
  biografia: "",
  instagram: "",
  linkedin: "",
  whatsapp: "",
  site: "",
  tema_materia: "",
  observacoes: "",
};

// ajuste esse array se o backend exigir campos diferentes
const REQUIRED_FIELDS: (keyof FormState)[] = [
  "nome_empresa",
  "cargo",
  "biografia",
  "tema_materia",
];

export default function FormularioCliente() {
  const params = useParams();
  const token = params.token as string;

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [touched, setTouched] = useState(false);

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function isFieldInvalid(field: keyof FormState) {
    return touched && REQUIRED_FIELDS.includes(field) && form[field].trim() === "";
  }

  async function enviarFormulario(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    setErrorMsg("");

    const faltando = REQUIRED_FIELDS.filter((field) => form[field].trim() === "");
    if (faltando.length > 0) {
      setStatus("error");
      setErrorMsg("Preencha os campos obrigatórios antes de enviar.");
      return;
    }

    try {
      setLoading(true);
      setStatus("idle");

      const response = await fetch("/api/revista/formulario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, token }),
      });

      const result = await response.json();
      setLoading(false);

      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(result.message || "Erro ao enviar formulário. Tente novamente.");
      }
    } catch (err) {
      console.error("ERRO:", err);
      setLoading(false);
      setStatus("error");
      setErrorMsg("Erro interno. Verifique sua conexão e tente novamente.");
    }
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center border border-[#d4af37]/30 bg-[#111111] rounded-2xl p-10">
          <div className="mx-auto mb-6 w-14 h-14 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-white text-2xl font-semibold mb-2">Formulário enviado!</h2>
          <p className="text-white/60 text-sm">
            Recebemos suas informações. Nossa equipe da Revista Empreende Brasil entrará em contato em breve.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16 px-6">
      <form onSubmit={enviarFormulario} className="max-w-3xl mx-auto">
        <div className="mb-10">
          <span className="text-[#d4af37] text-xs font-semibold tracking-[0.2em] uppercase">
            Revista Empreende Brasil
          </span>
          <h1 className="text-white text-3xl md:text-4xl font-bold mt-2 mb-3">
            Formulário da Matéria
          </h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Preencha os dados abaixo para que possamos preparar sua matéria com todas as informações corretas.
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-white/80 text-sm font-semibold uppercase tracking-wide mb-4 border-b border-white/10 pb-2">
              Dados da Empresa
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Nome da empresa" required invalid={isFieldInvalid("nome_empresa")}>
                <input
                  className={inputClass(isFieldInvalid("nome_empresa"))}
                  value={form.nome_empresa}
                  onChange={(e) => updateField("nome_empresa", e.target.value)}
                  placeholder="Ex: Monatiza"
                />
              </Field>

              <Field label="Cargo" required invalid={isFieldInvalid("cargo")}>
                <input
                  className={inputClass(isFieldInvalid("cargo"))}
                  value={form.cargo}
                  onChange={(e) => updateField("cargo", e.target.value)}
                  placeholder="Ex: CEO e Fundador"
                />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="text-white/80 text-sm font-semibold uppercase tracking-wide mb-4 border-b border-white/10 pb-2">
              Sobre Você
            </h2>
            <Field label="Biografia" required invalid={isFieldInvalid("biografia")}>
              <textarea
                className={`${inputClass(isFieldInvalid("biografia"))} h-36 resize-none`}
                value={form.biografia}
                onChange={(e) => updateField("biografia", e.target.value)}
                placeholder="Conte um pouco sobre sua trajetória e a empresa"
              />
            </Field>
          </section>

          <section>
            <h2 className="text-white/80 text-sm font-semibold uppercase tracking-wide mb-4 border-b border-white/10 pb-2">
              Redes e Contato
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Instagram">
                <input
                  className={inputClass(false)}
                  value={form.instagram}
                  onChange={(e) => updateField("instagram", e.target.value)}
                  placeholder="@suaempresa"
                />
              </Field>
              <Field label="LinkedIn">
                <input
                  className={inputClass(false)}
                  value={form.linkedin}
                  onChange={(e) => updateField("linkedin", e.target.value)}
                  placeholder="linkedin.com/in/voce"
                />
              </Field>
              <Field label="WhatsApp">
                <input
                  className={inputClass(false)}
                  value={form.whatsapp}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </Field>
              <Field label="Site">
                <input
                  className={inputClass(false)}
                  value={form.site}
                  onChange={(e) => updateField("site", e.target.value)}
                  placeholder="www.seusite.com.br"
                />
              </Field>
            </div>
          </section>

          <section>
            <h2 className="text-white/80 text-sm font-semibold uppercase tracking-wide mb-4 border-b border-white/10 pb-2">
              Sobre a Matéria
            </h2>
            <div className="space-y-4">
              <Field label="Tema da matéria" required invalid={isFieldInvalid("tema_materia")}>
                <input
                  className={inputClass(isFieldInvalid("tema_materia"))}
                  value={form.tema_materia}
                  onChange={(e) => updateField("tema_materia", e.target.value)}
                  placeholder="Ex: Inovação no mercado financeiro"
                />
              </Field>
              <Field label="Observações">
                <textarea
                  className={`${inputClass(false)} h-28 resize-none`}
                  value={form.observacoes}
                  onChange={(e) => updateField("observacoes", e.target.value)}
                  placeholder="Alguma informação adicional que devemos saber?"
                />
              </Field>
            </div>
          </section>
        </div>

        {status === "error" && (
          <div className="mt-8 border border-red-500/30 bg-red-500/10 text-red-300 text-sm rounded-lg p-4">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-10 w-full bg-[#d4af37] hover:bg-[#c19d2e] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-xl transition-colors"
        >
          {loading ? "Enviando..." : "Enviar Formulário"}
        </button>
      </form>
    </div>
  );
}

function inputClass(invalid: boolean) {
  return `w-full bg-[#161616] border ${
    invalid ? "border-red-500/60" : "border-white/10"
  } text-white placeholder:text-white/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]/60 focus:ring-1 focus:ring-[#d4af37]/30 transition-colors`;
}

function Field({
  label,
  required,
  invalid,
  children,
}: {
  label: string;
  required?: boolean;
  invalid?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-white/70 text-xs font-medium mb-1.5">
        {label}
        {required && <span className="text-[#d4af37] ml-1">*</span>}
      </span>
      {children}
      {invalid && (
        <span className="block text-red-400 text-xs mt-1">Campo obrigatório</span>
      )}
    </label>
  );
}