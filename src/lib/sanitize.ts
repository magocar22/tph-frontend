// src/lib/sanitize.ts
import sanitizeHtml from "sanitize-html";

type SanitizeOptions = {
  /** Permite iframes (YouTube/Vimeo/Maps) con allowlist */
  allowIframes?: boolean;
  /** Permite el atributo style (NO recomendado; si lo activas, mejor limitar allowedStyles) */
  allowInlineStyles?: boolean;
};

const DEFAULT_IFRAME_HOSTS = [
  "www.youtube.com",
  "www.youtube-nocookie.com",
  "youtu.be",
  "player.vimeo.com",
  "www.google.com",
  "maps.google.com",
  "maps.google.es",
];

export function sanitizeWPHtml(
  dirtyHtml: string | null | undefined,
  options: SanitizeOptions = {},
): string {
  if (!dirtyHtml) return "";

  const { allowIframes = true, allowInlineStyles = false } = options;

  const allowedTags = [
    // Texto y estructura
    "p",
    "br",
    "hr",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "blockquote",
    "q",
    "ul",
    "ol",
    "li",
    "pre",
    "code",

    // Enlaces e imágenes
    "a",
    "img",

    // Contenedores típicos WP/ACF
    "figure",
    "figcaption",
    "span",
    "div",

    // Tablas
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",

    // Otros
    "sup",
    "sub",
  ];

  if (allowIframes) allowedTags.push("iframe");

  const allowedAttributes: sanitizeHtml.IOptions["allowedAttributes"] = {
    "*": [
      "class",
      "id",
      "role",
      "aria-label",
      "aria-hidden",
      "lang",
      "dir",
      "title",
    ],
    a: ["href", "name", "target", "rel", "aria-label", "title"],
    img: [
      "src",
      "srcset",
      "sizes",
      "alt",
      "title",
      "width",
      "height",
      "loading",
      "decoding",
    ],
  };

  if (allowIframes) {
    allowedAttributes.iframe = [
      "src",
      "width",
      "height",
      "title",
      "allow",
      "allowfullscreen",
      "frameborder",
      "loading",
      "referrerpolicy",
    ];
  }

  // Por defecto NO permitimos style inline
  if (allowInlineStyles) {
    allowedAttributes["*"] = [...(allowedAttributes["*"] || []), "style"];
  }

  return sanitizeHtml(dirtyHtml, {
    allowedTags,
    allowedAttributes,

    // Bloquea esquemas peligrosos
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,

    // Iframes seguros (si están habilitados)
    allowedIframeHostnames: allowIframes ? DEFAULT_IFRAME_HOSTS : [],

    // No permitir <style> ni <script> (sanitize-html ya los elimina si no están allowedTags)
    allowVulnerableTags: false,

    // No bloqueamos clases para no romper layout actual (modo “sin dolor”)
    allowedClasses: {
      "*": [/^.*$/],
    },

    // Transformaciones para endurecer seguridad y consistencia
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href || "";
        const isHttp =
          href.startsWith("http://") || href.startsWith("https://");

        // Si el editor pone target _blank, forzamos seguridad correcta
        if (attribs.target === "_blank") {
          const rel = new Set((attribs.rel || "").split(" ").filter(Boolean));
          rel.add("noopener");
          rel.add("noreferrer");
          attribs.rel = Array.from(rel).join(" ");
        } else if (isHttp && !attribs.rel) {
          // Enlaces externos: rel seguro aunque no haya target
          attribs.rel = "noopener noreferrer";
        }

        return { tagName, attribs };
      },

      img: (tagName, attribs) => {
        // Defaults de rendimiento
        attribs.loading = attribs.loading || "lazy";
        attribs.decoding = attribs.decoding || "async";
        return { tagName, attribs };
      },

      iframe: (tagName, attribs) => {
        // Defaults de seguridad y rendimiento
        attribs.loading = attribs.loading || "lazy";
        attribs.referrerpolicy = attribs.referrerpolicy || "no-referrer";
        // allow: limita permisos del iframe (seguro y compatible)
        attribs.allow =
          attribs.allow ||
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

        // title ayuda accesibilidad
        attribs.title = attribs.title || "Embedded content";
        return { tagName, attribs };
      },
    },
  });
}

export function sanitizeWPText(dirtyHtml: string | null | undefined): string {
  if (!dirtyHtml) return "";

  return sanitizeHtml(dirtyHtml, {
    allowedTags: [],
    allowedAttributes: {},
    allowedSchemes: [],
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
  }).trim();
}
