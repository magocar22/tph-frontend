import type { APIRoute } from 'astro';

// 1. OBTENER LA URL REAL (Nube o Local)
const STRAPI_URL = import.meta.env.PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

export const POST: APIRoute = async ({ request, cookies }) => {
  const data = await request.json();
  const { identifier, password } = data;

  if (!identifier || !password) {
    return new Response(JSON.stringify({ message: "Faltan datos" }), { status: 400 });
  }

  try {
    // 2. USAR LA URL DINÁMICA
    const strapiRes = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const strapiData = await strapiRes.json();

    if (!strapiRes.ok || !strapiData.jwt) {
      return new Response(JSON.stringify({ message: "Usuario o contraseña incorrectos" }), { status: 401 });
    }

    // 3. GUARDAR COOKIE
    cookies.set("jwt", strapiData.jwt, {
      path: "/",
      httpOnly: true,
      secure: import.meta.env.PROD, // True en producción (HTTPS), false en local
      maxAge: 60 * 60 * 24 * 7,
    });

    cookies.set("username", strapiData.user.username, {
      path: "/",
      httpOnly: false, 
      maxAge: 60 * 60 * 24 * 7,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ message: "Error de conexión con el servidor" }), { status: 500 });
  }
};