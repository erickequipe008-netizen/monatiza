"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Rotas internas (admin / redação) não usam o cabeçalho e rodapé públicos.
function isInternal(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname === "/app" ||
    pathname.startsWith("/app/") ||
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/register" ||
    pathname.startsWith("/register/") ||
    pathname.startsWith("/assinar") ||
    pathname === "/painel/login"
  );
}

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  if (isInternal(pathname)) return <>{children}</>;
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
