# Setup de Assinantes (Stripe)

**Fluxo:** `/assinantes` → "Assinar" → `/assinar` (cria conta) → Stripe Checkout (paga) →
webhook confirma → `/painel` (área de membros liberada).

A pessoa cria a conta, mas o conteúdo/área só liberam **depois do pagamento confirmado**
pelo webhook (o `status` do assinante só é escrito pelo servidor, nunca pelo cliente).

---

## 1. Banco de dados (Supabase)

No Supabase → **SQL Editor** → cole e rode o conteúdo de
[`supabase/migrations/0001_create_subscribers.sql`](./migrations/0001_create_subscribers.sql).

## 2. Stripe

1. **Produto:** crie um produto "Assinatura Monatiza".
2. **Preços recorrentes:** adicione dois preços — Mensal e Anual — e copie o `price_...` de cada.
   - ⚠️ Os valores exibidos em `/assinantes` (R$ 19,90/mês e R$ 199/ano) são **visuais**. Eles
     precisam bater com os preços criados no Stripe. Para alterar valores, edite o array `PLANS`
     em `app/assinantes/page.tsx` **e** crie os preços correspondentes no Stripe.
3. **API keys** (Developers → API keys): copie a secret (`sk_...`) e a publishable (`pk_...`).
4. **Webhook** (Developers → Webhooks → Add endpoint):
   - URL: `https://www.monatiza.com/api/webhooks/stripe`
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copie o **Signing secret** (`whsec_...`).

## 3. Variáveis de ambiente

Na **Vercel** (Project Settings → Environment Variables) e no `.env.local` para testar localmente:

```
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_PRICE_MENSAL=price_...
STRIPE_PRICE_ANUAL=price_...
NEXT_PUBLIC_SITE_URL=https://www.monatiza.com
```

## 4. Teste

Use o **modo de teste** do Stripe (chaves `sk_test`/`pk_test`, cartão `4242 4242 4242 4242`,
validade futura, CVC qualquer). Confirme que o `/painel` libera após o pagamento. Depois troque
para as chaves **live**.
