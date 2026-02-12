import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: 'https://tuprimerhogar.es',
  output: 'server',

  integrations: [
    tailwind(), 
    sitemap({
      filter: (page) => {
        // Filtramos rutas privadas
        return !page.includes('/inversores/dashboard') && 
               !page.includes('/api/') &&
               !page.includes('/admin');
      },
    }),  
    react()
  ],

  image: {
    domains: [
        "localhost", 
        "127.0.0.1", 
        "admin.tuprimerhogar.es", // Tu dominio de WP
        "tph.maglab.es",
    ],
    // 2. Patrón de seguridad para imágenes HTTPS
    remotePatterns: [{ protocol: "https" }],
  },

  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});