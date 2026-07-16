import type { Metadata } from "next";
import ComunidadeLanding from "@/components/ComunidadeLanding";

export const metadata: Metadata = {
  title: "Monatiza — a primeira rede social de notícias do mundo",
  description:
    "A Monatiza une jornalismo e comunidade num só lugar: publique, debata e acompanhe o que move o mercado em tempo real. Grátis, para sempre.",
  alternates: { canonical: "https://www.monatiza.com/comunidade" },
};

export default function ComunidadePage() {
  return <ComunidadeLanding />;
}
