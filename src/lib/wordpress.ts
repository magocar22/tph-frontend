// src/lib/wordpress.ts

// Tu URL local de XAMPP (Asegúrate de que el nombre de la carpeta en htdocs es correcto)
const WP_URL = "http://localhost/tph-backend"; 

interface WPFetchOptions {
  endpoint: string;
  params?: Record<string, string>;
}

export async function fetchWP<T>({ endpoint, params }: WPFetchOptions): Promise<T> {
  const url = new URL(`${WP_URL}/wp-json/wp/v2/${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  // Truco Pro: Añadimos '_embed' para que WP nos mande la foto destacada y autor en la misma petición
  if (!url.searchParams.has('_embed')) {
      url.searchParams.append('_embed', 'true');
  }

  const res = await fetch(url.toString());
  
  if (!res.ok) {
    console.error(`Error fetching WP: ${url.toString()}`);
    throw new Error(`Error fetching WP: ${res.statusText}`);
  }

  return await res.json();
}