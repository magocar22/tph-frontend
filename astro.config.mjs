import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

// CAMBIO: Importamos Netlify y quitamos Node
import netlify from "@astrojs/netlify";

export default defineConfig({
  site: 'https://tuprimerhogar.es',
  output: 'server',

  integrations: [tailwind(), sitemap(), react()],

  image: {
    domains: ["localhost", "127.0.0.1", "res.cloudinary.com"], // Añade Cloudinary por si acaso
  },

  // CAMBIO: Usamos el adaptador de Netlify
  adapter: netlify(),
});