import { z, defineCollection } from "astro:content";

// Definimos el "esquema" (los campos que tendrá cada proyecto)
const proyectosCollection = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      ubicacion: z.string(), // Ej: Málaga Capital
      estado: z.enum(["En comercialización", "En construcción", "Entregado"]),
      imagenPrincipal: image(), // Astro gestionará la imagen
      descripcionCorta: z.string(),
      // Puedes añadir más campos: precio, fechaEntrega, etc.
    }),
});

export const collections = {
  proyectos: proyectosCollection,
};
