import type { Metadata } from "next";

// Página utilitária/transacional (sem conteúdo editorial): fora do índice do
// Google para não pesar na avaliação de qualidade do site (AdSense).
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function NoIndexLayout({ children }: { children: React.ReactNode }) {
  return children;
}
