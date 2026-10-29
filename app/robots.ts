import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Áreas privadas/utilitárias sem valor editorial: fora do rastreamento
        // para o Google avaliar o site apenas pelo conteúdo real (notícias).
        disallow: ["/admin", "/dashboard", "/editorial", "/api", "/app", "/painel"],
      },
    ],

    sitemap: [
      "https://www.monatiza.com/sitemap.xml",
      "https://www.monatiza.com/news-sitemap.xml",
    ],
  };
}