// ─────────────────────────────────────────────────────────────
// Configuração central do Google AdSense
// ─────────────────────────────────────────────────────────────
// O ID do editor (publisher) já está ativo no site.
export const ADSENSE_CLIENT = "ca-pub-2575495674688917";

// Espaços de anúncio reservados pelo layout do portal.
// 👉 Crie cada "bloco de anúncio" no painel do AdSense
//    (https://www.google.com/adsense → Anúncios → Por bloco de anúncios)
//    e cole aqui o número do slot (data-ad-slot). Ex.: "1234567890".
//
// Enquanto o slot estiver vazio, o espaço fica reservado no layout
// (visível apenas em desenvolvimento) e NÃO aparece nenhuma caixa
// vazia em produção — assim o site nunca fica "solto" ou quebrado.
export const AD_SLOTS = {
  homeTop: "",        // faixa horizontal (leaderboard) no topo da home
  homeInFeed: "",     // retângulo no meio do feed da home
  articleInline: "",  // dentro do corpo da matéria (após a introdução)
  articleSidebar: "", // barra lateral fixa da matéria
  articleBottom: "",  // fim da matéria, antes dos relacionados
  categoryTop: "",    // topo das páginas de categoria
} as const;

export type AdPlacement = keyof typeof AD_SLOTS;
