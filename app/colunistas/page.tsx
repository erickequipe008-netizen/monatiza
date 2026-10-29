import type { Metadata } from "next";
import ColunistasClient from "./ColunistasClient";

export const metadata: Metadata = {
  title: "Seja colunista da Revista Monatiza | monatiza",
  description:
    "A Revista Monatiza abre chamada para novos colunistas em todo o Brasil: escolha seu plano, publique artigos com revisão editorial e divulgue seu trabalho.",
};

export default function ColunistasPage() {
  return <ColunistasClient />;
}
