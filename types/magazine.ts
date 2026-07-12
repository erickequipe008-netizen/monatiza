/** Tipos da loja de revistas digitais. */

export const MAGAZINE_PRICE = 17.8;

export const MAGAZINE_CATEGORIES = [
  "Negócios",
  "Tecnologia",
  "IA",
  "Marketing",
  "Economia",
  "Empreendedorismo",
] as const;

export type MagazineCategory = (typeof MAGAZINE_CATEGORIES)[number];

export type Magazine = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  edition: string | null;
  category: string | null;
  price: number;
  cover_url: string | null;
  /** Caminho no bucket privado — nunca exposto ao cliente. */
  pdf_path: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

/** Versão pública (sem o caminho do PDF privado). */
export type MagazinePublic = Omit<Magazine, "pdf_path">;

export type MagazineStatus = "pending" | "paid" | "failed";

export type MagazinePurchase = {
  id: string;
  stripe_session_id: string;
  magazine_id: string | null;
  customer_name: string | null;
  customer_email: string;
  amount: number;
  status: MagazineStatus;
  payment_date: string | null;
  download_sent: boolean;
  created_at: string;
};

/** Formata um valor numérico como preço BRL (R$ 17,80). */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
}
