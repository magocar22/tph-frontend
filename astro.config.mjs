import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import node from "@astrojs/node";

export default defineConfig({
  // 1. Tu dominio
  site: 'https://tuprimerhogar.es',

  // 2. CAMBIO CRUCIAL: Activamos el modo servidor (SSR)
  output: 'server',

  // 3. Integraciones
  integrations: [tailwind(), sitemap(), react()],

  // 4. Dominios permitidos para imágenes (Añadimos la IP numérica)
  image: {
    domains: ["localhost", "127.0.0.1"],
  },

  // 5. Configuración del servidor Node.js
  adapter: node({
    mode: 'standalone',
  }),
});