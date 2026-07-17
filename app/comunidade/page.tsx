import type { Metadata } from "next";
import ComunidadeLanding from "@/components/ComunidadeLanding";

export const metadata: Metadata = {
  title: "Comunidade Monatiza — onde notícias viram conexões",
  description:
    "Acompanhe as notícias que movimentam o mercado, compartilhe suas ideias e conecte-se com empresários, profissionais e criadores num só lugar. Gratuito para começar.",
  alternates: { canonical: "https://www.monatiza.com/comunidade" },
};

export default function ComunidadePage() {
  return <ComunidadeLanding />;
}
