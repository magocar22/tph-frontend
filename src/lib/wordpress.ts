// src/lib/wordpress.ts

// 1. Definimos la URL base. 
// Si existe la variable de entorno (Producción) la usa, si no, usa el fallback (Local).
export const WP_URL = import.meta.env.PUBLIC_WP_URL || "http://localhost/tph-backend";

interface WPFetchOptions {
  endpoint: string;
  params?: Record<string, string>;
  token?: string; // Agregamos soporte para enviar el token JWT
}

export async function fetchWP<T>({ endpoint, params, token }: WPFetchOptions): Promise<T> {
  // Aseguramos que la URL no tenga doble barra al final antes de concatenar
  const baseUrl = WP_URL.replace(/\/$/, '');
  const url = new URL(`${baseUrl}/wp-json/wp/v2/${endpoint}`);

  // Añadimos parámetros a la URL (ej: ?slug=proyecto-1)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  // Siempre pedimos datos embebidos para evitar múltiples requests
  if (!url.searchParams.has('_embed')) {
    url.searchParams.append('_embed', 'true');
  }

  // Configuración de cabeceras (Auth)
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url.toString(), { headers });

    if (!res.ok) {
      // En Cloudflare es mejor capturar el error sin tumbar la app entera
      console.error(`[WP Error] Status: ${res.status} URL: ${url.toString()}`);
      throw new Error(`Error fetching WP: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("[WP Fetch Error]", error);
    throw error; // Re-lanzamos el error para que pueda ser manejado por el llamador
  }
}