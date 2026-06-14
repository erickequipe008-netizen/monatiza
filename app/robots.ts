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
      "https://monatiza.com/sitemap.xml",
      "https://monatiza.com/news-sitemap.xml",
    ],
  };
}