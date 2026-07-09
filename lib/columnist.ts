// Planos do programa de colunistas — usados pelo checkout, webhook e páginas.
// Valores em centavos (BRL). Créditos = artigos liberados por mês no plano.

export interface ColumnistPlan {
  id: 1 | 2 | 3;
  name: string;
  badge: string;
  amount: number; // centavos, cobrança mensal
  credits: number; // créditos de publicação liberados por mês
  perks: string[];
}

export const COLUMNIST_PLANS: Record<number, ColumnistPlan> = {
  1: {
    id: 1,
    name: "Plano 1 — Completo",
    badge: "Plano 1 · Completo",
    amount: 9500,
    credits: 4,
    perks: [
      "Até 4 artigos por mês no site (1 por semana)",
      "1 publicação impressa a cada 2 meses",
      "Recebe 2 edições da Revista impressa",
    ],
  },
  2: {
    id: 2,
    name: "Plano 2 — Intermediário",
    badge: "Plano 2 · Intermediário",
    amount: 7000,
    credits: 4,
    perks: [
      "Até 4 artigos por mês no site (1 por semana)",
      "1 publicação impressa a cada 3 meses",
      "Recebe 1 edição da Revista impressa",
    ],
  },
  3: {
    id: 3,
    name: "Plano 3 — Essencial",
    badge: "Plano 3 · Essencial",
    amount: 5000,
    credits: 3,
    perks: [
      "Até 3 artigos por mês no site (1 por semana)",
      "Sem publicação na Revista impressa",
      "Se já tem site ou portal, sua logo e link entram junto ao texto",
    ],
  },
};

// Crédito extra para colunista com plano ativo (artigo adicional no mês).
export const COLUMNIST_EXTRA_CREDIT_PRICE = 2500; // R$ 25,00 cada

export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
