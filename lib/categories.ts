// Single source of truth for site categories / navigation.
// Used by the Header (top nav + hamburger) and the shared <CategoryFeed /> pages.
// Keep this in sync with the admin CATEGORIES lists (app/admin/articles/*).

export interface FeedCategory {
  slug: string; // route segment, e.g. "brasil" → /brasil
  label: string; // short nav label, e.g. "Brasil"
  title: string; // page heading, e.g. "Tecnologia"
  filter: string; // Supabase ilike pattern, e.g. "%Brasil%"
  icon: string; // lucide icon name (see components/iconMap.ts)
  blurb: string; // newsletter description in the sidebar
  tags: string[]; // topic tags shown in the sidebar
  footer: string; // footer tagline
  emptyLabel: string; // used in "Nenhuma matéria {emptyLabel} publicada ainda."
}

// Categories rendered by the shared <CategoryFeed /> component.
// Negócios, IA e Mercado já têm páginas próprias e ficam apenas na navegação.
export const FEED_CATEGORIES: FeedCategory[] = [
  {
    slug: "brasil",
    label: "Brasil",
    title: "Brasil",
    filter: "%Brasil%",
    icon: "Flag",
    blurb: "Política, economia e os fatos que definem o país — resumidos pra você.",
    tags: ["Economia", "Brasília", "Eleições", "Reformas", "STF", "Congresso"],
    footer: "Cobertura completa do Brasil",
    emptyLabel: "do Brasil",
  },
  {
    slug: "tech",
    label: "Tech",
    title: "Tecnologia",
    filter: "%Tecnologia%",
    icon: "Laptop",
    blurb: "Inovação, gadgets, software e a transformação digital — toda semana.",
    tags: ["Software", "Gadgets", "Apple", "Google", "Cloud", "Cibersegurança"],
    footer: "Cobertura completa de Tecnologia",
    emptyLabel: "de Tecnologia",
  },
  {
    slug: "politica",
    label: "Política",
    title: "Política",
    filter: "%Política%",
    icon: "Landmark",
    blurb: "Poder, Congresso e decisões que afetam o seu bolso — sem rodeios.",
    tags: ["Congresso", "Governo", "Eleições", "STF", "Brasília", "Economia"],
    footer: "Cobertura completa de Política",
    emptyLabel: "de Política",
  },
  {
    slug: "saude",
    label: "Saúde",
    title: "Saúde",
    filter: "%Saúde%",
    icon: "HeartPulse",
    blurb: "Bem-estar, medicina e ciência pra viver melhor — direto na sua caixa.",
    tags: ["Bem-estar", "Medicina", "Nutrição", "Mente", "Ciência", "Fitness"],
    footer: "Cobertura completa de Saúde",
    emptyLabel: "de Saúde",
  },
  {
    slug: "empreende",
    label: "Empreende",
    title: "Empreende",
    filter: "%Empreende%",
    icon: "Lightbulb",
    blurb: "Histórias, táticas e ferramentas pra quem constrói o próprio negócio.",
    tags: ["Pequenos Negócios", "MEI", "Vendas", "Marketing", "Gestão", "Franquias"],
    footer: "Cobertura completa de Empreendedorismo",
    emptyLabel: "de Empreendedorismo",
  },
  {
    slug: "startups",
    label: "Startups",
    title: "Startups",
    filter: "%Startups%",
    icon: "Rocket",
    blurb: "Rodadas, fundadores e o ecossistema de inovação — toda semana.",
    tags: ["Venture Capital", "Fundadores", "SaaS", "Fintech", "Unicórnios", "Rodadas"],
    footer: "Cobertura completa de Startups",
    emptyLabel: "de Startups",
  },
  {
    slug: "carreira",
    label: "Carreira",
    title: "Carreira",
    filter: "%Carreira%",
    icon: "GraduationCap",
    blurb: "Trabalho, liderança e crescimento profissional — pra ir além.",
    tags: ["Liderança", "Mercado de Trabalho", "Soft Skills", "Home Office", "Salários", "Networking"],
    footer: "Cobertura completa de Carreira",
    emptyLabel: "de Carreira",
  },
  {
    slug: "revista",
    label: "Revista",
    title: "Revista",
    filter: "%Revista%",
    icon: "BookOpen",
    blurb: "Reportagens especiais e os grandes perfis da Monatiza — sem pressa.",
    tags: ["Especiais", "Perfis", "Ensaios", "Entrevistas", "Bastidores", "Cultura"],
    footer: "Edições e reportagens especiais da Monatiza",
    emptyLabel: "da Revista",
  },
];

export function getFeedCategory(slug: string): FeedCategory | undefined {
  return FEED_CATEGORIES.find((c) => c.slug === slug);
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

// Full primary navigation (top bar + hamburger). Order is intentional.
// Inclui as 3 com página própria (Negócios, IA, Mercado), as 8 do CategoryFeed,
// e o item especial "Assinantes" (página de planos).
export const NAV_ITEMS: NavItem[] = [
  { label: "Negócios", href: "/negocios", icon: "Briefcase" },
  { label: "IA", href: "/ia", icon: "Cpu" },
  { label: "Mercado", href: "/mercado", icon: "TrendingUp" },
  { label: "Brasil", href: "/brasil", icon: "Flag" },
  { label: "Política", href: "/politica", icon: "Landmark" },
  { label: "Tech", href: "/tech", icon: "Laptop" },
  { label: "Empreende", href: "/empreende", icon: "Lightbulb" },
  { label: "Startups", href: "/startups", icon: "Rocket" },
  { label: "Carreira", href: "/carreira", icon: "GraduationCap" },
  { label: "Saúde", href: "/saude", icon: "HeartPulse" },
  { label: "Revista", href: "/revista", icon: "BookOpen" },
  { label: "Assinantes", href: "/assinantes", icon: "Crown" },
];
