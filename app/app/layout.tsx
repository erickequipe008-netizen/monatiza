import { Manrope } from "next/font/google";
import PremiumGuard from "@/components/premium/PremiumGuard";

// Fonte geométrica e limpa, no espírito Google Sans / Gemini.
const appFont = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

// Área privada do assinante: fora dos índices de busca.
export const metadata = {
  title: "MonatizaPro",
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={appFont.className}>
      <PremiumGuard>{children}</PremiumGuard>
    </div>
  );
}
