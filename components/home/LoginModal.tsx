"use client";

import { X } from "lucide-react";

interface LoginModalProps {
  dark: boolean;
  onClose: () => void;
}

export function LoginModal({ dark, onClose }: LoginModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-5">
      <div className={`w-full max-w-[460px] p-8 ${dark ? "bg-[#111] text-white" : "bg-white text-black"}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[28px] md:text-[34px] font-serif font-bold">MONATIZA Assinar</h2>
          <button aria-label="Fechar" onClick={onClose} className="hover:opacity-60 transition"><X size={22} /></button>
        </div>
        <p className="text-[15px] leading-7 text-zinc-500 mb-7">
          Receba análises exclusivas, tendências do mercado, tecnologia, negócios, inteligência artificial e conteúdos reservados para assinantes.
        </p>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Digite seu e-mail"
            className={`w-full h-[54px] border px-5 bg-transparent outline-none mb-4 ${dark ? "border-zinc-700 placeholder:text-zinc-500 text-white" : "border-zinc-300"}`}
          />
          <input
            type="password"
            placeholder="Sua senha"
            className={`w-full h-[54px] px-5 border bg-transparent outline-none ${dark ? "border-zinc-700 placeholder:text-zinc-500 text-white" : "border-zinc-300"}`}
          />
          <button className="w-full h-[54px] bg-red-600 text-white font-semibold hover:bg-red-700 transition-all">Entrar na área exclusiva</button>
          <button className={`w-full h-[54px] border font-semibold hover:opacity-70 transition ${dark ? "border-zinc-600" : "border-zinc-300"}`}>Criar nova conta</button>
        </div>
      </div>
    </div>
  );
}
