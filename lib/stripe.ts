import Stripe from "stripe";

let client: Stripe | null = null;

/**
 * Cliente Stripe "preguiçoso": só instancia quando há STRIPE_SECRET_KEY.
 * Assim o build não quebra enquanto a chave ainda não foi configurada.
 */
export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY não configurada");
    client = new Stripe(key);
  }
  return client;
}
