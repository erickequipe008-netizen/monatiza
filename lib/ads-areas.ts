/**
 * Onde o AdSense pode aparecer.
 *
 * Política (para conformidade com o AdSense): anúncios SÓ em conteúdo
 * editorial — a home, as páginas de matéria e as páginas de categoria de
 * notícias. Nunca em páginas rasas/transacionais (busca, login, cadastro,
 * assinatura, loja de revistas, institucionais) nem nas áreas privadas
 * (/app, /admin, /dashboard, /editorial, /painel). Isso evita a violação
 * "conteúdo de baixo valor" por anúncio em página sem conteúdo.
 */

/** Áreas privadas — nunca têm anúncio nem devem ser rastreadas. */
export const AD_FREE_PREFIXES = ["/app", "/admin", "/dashboard", "/editorial", "/painel"];

/** Segmentos de categoria de notícias (conteúdo editorial → elegível a anúncio). */
export const NEWS_CATEGORY_SLUGS = [
  "negocios",
  "ia",
  "mercado",
  "brasil",
  "tech",
  "politica",
  "saude",
  "empreende",
  "startups",
  "carreira",
];

export function isAdFreePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return AD_FREE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/**
 * True apenas em superfícies com conteúdo editorial real:
 *  • home ("/")
 *  • matérias ("/noticia/...")
 *  • páginas de categoria de notícias ("/tech", "/brasil", …)
 */
export function isAdEligiblePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (isAdFreePath(pathname)) return false;
  if (pathname === "/") return true;
  if (pathname === "/noticia" || pathname.startsWith("/noticia/")) return true;
  const seg = pathname.split("/").filter(Boolean)[0];
  return !!seg && NEWS_CATEGORY_SLUGS.includes(seg);
}
