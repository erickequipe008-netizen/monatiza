// Idioma automático do app: detecta pelo idioma do aparelho/navegador
// (EUA → inglês, Japão → japonês, etc.), com opção de trocar manualmente.
export type Lang = "pt" | "en" | "es" | "ja" | "fr";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "pt", label: "Português" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "ja", label: "日本語" },
  { code: "fr", label: "Français" },
];

const DICT: Record<string, Record<Lang, string>> = {
  home: { pt: "Início", en: "Home", es: "Inicio", ja: "ホーム", fr: "Accueil" },
  explore: { pt: "Explorar", en: "Explore", es: "Explorar", ja: "話題を検索", fr: "Explorer" },
  notifications: { pt: "Notificações", en: "Notifications", es: "Notificaciones", ja: "通知", fr: "Notifications" },
  messages: { pt: "Mensagens", en: "Messages", es: "Mensajes", ja: "メッセージ", fr: "Messages" },
  community: { pt: "Comunidade", en: "Community", es: "Comunidad", ja: "コミュニティ", fr: "Communauté" },
  news: { pt: "Notícias", en: "News", es: "Noticias", ja: "ニュース", fr: "Actualités" },
  library: { pt: "Biblioteca", en: "Library", es: "Biblioteca", ja: "ライブラリ", fr: "Bibliothèque" },
  profile: { pt: "Perfil", en: "Profile", es: "Perfil", ja: "プロフィール", fr: "Profil" },
  verification: { pt: "Verificação", en: "Verification", es: "Verificación", ja: "認証", fr: "Vérification" },
  exclusive: { pt: "Exclusivo", en: "Exclusive", es: "Exclusivo", ja: "限定", fr: "Exclusif" },
  magazines: { pt: "Revistas", en: "Magazines", es: "Revistas", ja: "雑誌", fr: "Magazines" },
  newsletter: { pt: "Newsletter", en: "Newsletter", es: "Newsletter", ja: "ニュースレター", fr: "Newsletter" },
  dashboard: { pt: "Painel", en: "Dashboard", es: "Panel", ja: "ダッシュボード", fr: "Tableau de bord" },
  account: { pt: "Conta", en: "Account", es: "Cuenta", ja: "アカウント", fr: "Compte" },
  more: { pt: "Mais", en: "More", es: "Más", ja: "もっと見る", fr: "Plus" },
  publish: { pt: "Publicar", en: "Post", es: "Publicar", ja: "投稿する", fr: "Poster" },
  search: { pt: "Buscar", en: "Search", es: "Buscar", ja: "検索", fr: "Rechercher" },
  logout: { pt: "Sair", en: "Log out", es: "Cerrar sesión", ja: "ログアウト", fr: "Se déconnecter" },
  show_more: { pt: "Mostrar mais", en: "Show more", es: "Mostrar más", ja: "もっと見る", fr: "Afficher plus" },
  trending: { pt: "Assuntos do momento", en: "What’s happening", es: "Tendencias", ja: "トレンド", fr: "Tendances" },
  for_you: { pt: "Para você", en: "For you", es: "Para ti", ja: "おすすめ", fr: "Pour vous" },
  explore_sub: {
    pt: "Conteúdos, pessoas e assuntos.",
    en: "Content, people and topics.",
    es: "Contenidos, personas y temas.",
    ja: "コンテンツ・人・話題。",
    fr: "Contenus, personnes et sujets.",
  },
  terms: { pt: "Termos", en: "Terms", es: "Términos", ja: "利用規約", fr: "Conditions" },
  privacy: { pt: "Privacidade", en: "Privacy", es: "Privacidad", ja: "プライバシー", fr: "Confidentialité" },
  cookies: { pt: "Cookies", en: "Cookies", es: "Cookies", ja: "Cookie", fr: "Cookies" },
  accessibility: { pt: "Acessibilidade", en: "Accessibility", es: "Accesibilidad", ja: "アクセシビリティ", fr: "Accessibilité" },
  ads_info: { pt: "Informações sobre anúncios", en: "Ads info", es: "Información de anuncios", ja: "広告情報", fr: "Infos publicités" },
  language: { pt: "Idioma", en: "Language", es: "Idioma", ja: "言語", fr: "Langue" },
};

// Idioma do aparelho (navigator.language). Sem correspondência → inglês.
export function detectLang(): Lang {
  if (typeof navigator === "undefined") return "pt";
  const n = (navigator.language || navigator.languages?.[0] || "pt").toLowerCase();
  if (n.startsWith("pt")) return "pt";
  if (n.startsWith("es")) return "es";
  if (n.startsWith("ja")) return "ja";
  if (n.startsWith("fr")) return "fr";
  if (n.startsWith("en")) return "en";
  return "en";
}

export function getLang(): Lang {
  if (typeof window === "undefined") return "pt";
  const saved = localStorage.getItem("app_lang") as Lang | null;
  if (saved && LANGS.some((l) => l.code === saved)) return saved;
  return detectLang();
}

export function setLangPref(l: Lang) {
  if (typeof window === "undefined") return;
  localStorage.setItem("app_lang", l);
  window.dispatchEvent(new CustomEvent("monatiza:lang"));
}

export function t(lang: Lang, key: string): string {
  return DICT[key]?.[lang] ?? DICT[key]?.pt ?? key;
}
