import type { APIRoute } from 'astro';

// Tu URL local de WordPress
const WP_URL = "http://localhost/tph-backend"; 

export const POST: APIRoute = async ({ request, cookies }) => {
  const data = await request.json();
  const { identifier, password } = data; // 'identifier' es el usuario en el form

  if (!identifier || !password) {
    return new Response(JSON.stringify({ message: "Faltan datos" }), { status: 400 });
  }

  try {
    // 1. Pedimos el Token a WordPress
    const wpRes = await fetch(`${WP_URL}/wp-json/jwt-auth/v1/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: identifier,
        password: password
      }),
    });

    const wpData = await wpRes.json();

    // 2. Si falla (clave mal, usuario no existe...)
    if (!wpRes.ok || !wpData.token) {
      return new Response(JSON.stringify({ message: "Usuario o contraseña incorrectos" }), { status: 401 });
    }

    // 3. ÉXITO: Guardamos el TOKEN en cookie
    cookies.set("wp_jwt", wpData.token, {
      path: "/",
      httpOnly: true,
      secure: false, // false en local, true en producción
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    });

    // Guardamos el nombre para mostrar "Hola, Pepito"
    cookies.set("wp_user_display", wpData.user_display_name, {
      path: "/",
      httpOnly: false, 
      maxAge: 60 * 60 * 24 * 7,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ message: "Error de conexión con WordPress" }), { status: 500 });
  }
};