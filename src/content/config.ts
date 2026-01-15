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
// Definimos el "esquema" (los campos que tendrá cada entrada del blog)
const blogCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    titulo: z.string(),
    fecha: z.date(),
    imagen: image(),
    descripcion: z.string(),
    autor: z.string().default('Equipo TPH'),
    categoria: z.string().optional(), // Ej: "Corporativo", "Obras", "Prensa"
  }),
});

export const collections = {
  proyectos: proyectosCollection,
  blog: blogCollection,
};
