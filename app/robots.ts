import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],

    sitemap: [
      "https://www.monatiza.com/sitemap.xml",
      "https://www.monatiza.com/news-sitemap.xml",
    ],
  };
}