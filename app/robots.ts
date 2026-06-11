export default function robots() {
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

