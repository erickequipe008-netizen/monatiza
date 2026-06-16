/** @type {import('next').NextConfig} */
const nextConfig = {

  images: {

    remotePatterns: [

      {
        protocol: "https",
        hostname: "**",
      },

    ],

  },

  // Fixa a raiz do Turbopack nesta pasta (frontend/), evitando que ele
  // suba para /Users/adm e enxergue o app Ionic (monatiza/) ou outros
  // lockfiles fora deste projeto.
  turbopack: {
    root: __dirname,
  },

};

export default nextConfig;