/**
 * Áreas onde o AdSense NUNCA deve aparecer: ambiente do assinante,
 * redação e painéis administrativos. Anúncio é só no portal público.
 */
export const AD_FREE_PREFIXES = ["/app", "/admin", "/dashboard", "/editorial", "/painel"];

export function isAdFreePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return AD_FREE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
