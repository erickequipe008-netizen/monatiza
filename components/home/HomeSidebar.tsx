"use client";

import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
} from "lucide-react";

import type { CommercialAdData } from "@/components/home/CommercialAd";
import { AdSlot } from "@/components/home/AdSlot";

type HomeSidebarProps = {
  commercialAd1?: CommercialAdData | null;
  commercialAd2?: CommercialAdData | null;
};

export default function HomeSidebar({
  commercialAd1,
  commercialAd2,
}: HomeSidebarProps) {
  return (
    <aside className="w-full">
      <div className="space-y-7">

        {/* BRAND MONATIZA */}
        <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="bg-neutral-950 px-5 py-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white">
              Monatiza
            </span>
          </div>

          <div className="p-5">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-red-600">
              Conteúdo & Informação
            </p>

            <h3 className="text-xl font-black leading-tight text-neutral-950">
              Informação para quem transforma ideias em movimento.
            </h3>

            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Negócios, inovação, tecnologia, carreira e as histórias
              que movimentam o Brasil.
            </p>

            <Link
              href="/revista"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-red-600 transition hover:gap-3"
            >
              Conheça a Revista Monatiza
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {/* PUBLICIDADE 1 */}
        {commercialAd1 && (
          <section className="border-t border-neutral-200 pt-4">
            <p className="mb-3 text-center text-[9px] font-medium uppercase tracking-[0.2em] text-neutral-400">
              Publicidade
            </p>

            {commercialAd1.mobile_image_url && (
              <a
                href={commercialAd1.target_url || "#"}
                target={commercialAd1.target_url ? "_blank" : undefined}
                rel={commercialAd1.target_url ? "noopener noreferrer sponsored" : undefined}
                aria-label={`Publicidade: ${commercialAd1.name}`}
                className="group mx-auto block w-full max-w-[300px]"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={commercialAd1.mobile_image_url}
                    alt={commercialAd1.name || "Publicidade"}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <span className="absolute right-2 top-2 rounded bg-black/55 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white">
                    Publicidade
                  </span>
                </div>
              </a>
            )}
          </section>
        )}

        {/* REDES SOCIAIS */}
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 border-b border-neutral-200 pb-3">
            <h3 className="text-lg font-black text-neutral-950">
              Redes Sociais
            </h3>

            <p className="mt-1 text-xs text-neutral-500">
              Siga a Monatiza
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            <a
              href="#"
              aria-label="Instagram"
              title="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-xs font-black text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-100"
            >
              IG
            </a>

            <a
              href="#"
              aria-label="LinkedIn"
              title="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-xs font-black text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-100"
            >
              in
            </a>

            <a
              href="#"
              aria-label="YouTube"
              title="YouTube"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-[10px] font-black text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-100"
            >
              YT
            </a>

            <a
              href="#"
              aria-label="Facebook"
              title="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-sm font-black text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-100"
            >
              f
            </a>

            <a
              href="/comunidade"
              aria-label="Comunidade Monatiza"
              title="Comunidade Monatiza"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-100"
            >
              <MessageCircle size={17} />
            </a>

          </div>
        </section>

        {/* FUTURO GOOGLE ADS */}
        <AdSlot />

        {/* BRAND / INSTITUCIONAL */}
        <section className="overflow-hidden rounded-xl bg-neutral-950 p-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-500">
            Faça parte
          </p>

          <h3 className="mt-2 text-xl font-black leading-tight">
            Sua voz também pode estar na Monatiza.
          </h3>

          <p className="mt-3 text-sm leading-6 text-neutral-300">
            Compartilhe conhecimento, experiências e ideias com
            nossos leitores.
          </p>

          <Link
            href="/colunistas"
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white"
          >
            Conheça nossos colunistas
            <ArrowRight size={15} />
          </Link>
        </section>

        {/* PUBLICIDADE 2 */}
        {commercialAd2 && (
          <section className="border-t border-neutral-200 pt-4">
            <p className="mb-3 text-center text-[9px] font-medium uppercase tracking-[0.2em] text-neutral-400">
              Publicidade
            </p>

            {commercialAd2.mobile_image_url && (
              <a
                href={commercialAd2.target_url || "#"}
                target={commercialAd2.target_url ? "_blank" : undefined}
                rel={commercialAd2.target_url ? "noopener noreferrer sponsored" : undefined}
                aria-label={`Publicidade: ${commercialAd2.name}`}
                className="group mx-auto block w-full max-w-[300px]"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={commercialAd2.mobile_image_url}
                    alt={commercialAd2.name || "Publicidade"}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <span className="absolute right-2 top-2 rounded bg-black/55 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-white">
                    Publicidade
                  </span>
                </div>
              </a>
            )}
          </section>
        )}

        {/* NEWSLETTER */}
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">
            Newsletter
          </p>

          <h3 className="mt-2 text-lg font-black leading-tight text-neutral-950">
            As principais notícias direto para você.
          </h3>

          <p className="mt-2 text-sm leading-5 text-neutral-600">
            Acompanhe os destaques e conteúdos da Monatiza.
          </p>

          <Link
            href="/newsletter"
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-red-600"
          >
            Quero receber
            <ArrowRight size={14} />
          </Link>
        </section>

        {/* FUTURO GOOGLE ADS */}
        <AdSlot />

      </div>
    </aside>
  );
}