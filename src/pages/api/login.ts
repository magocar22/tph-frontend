// src/pages/api/login.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  const data = await request.json();
  const { identifier, password } = data;

  if (!identifier || !password) {
    return new Response(JSON.stringify({ message: "Faltan datos" }), { status: 400 });
  }

  try {
    // 1. Enviamos los datos a Strapi (Endpoint de login)
    const strapiRes = await fetch("http://127.0.0.1:1337/api/auth/local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const strapiData = await strapiRes.json();

    // 2. Si Strapi dice error...
    if (!strapiRes.ok || !strapiData.jwt) {
      return new Response(JSON.stringify({ message: "Usuario o contraseña incorrectos" }), { status: 401 });
    }

    // 3. ÉXITO: Guardamos el TOKEN (JWT) en una Cookie segura
    // httpOnly: true significa que el JavaScript del navegador no puede leerla (más seguro)
    cookies.set("jwt", strapiData.jwt, {
      path: "/",
      httpOnly: true, // Seguridad máxima
      secure: false,  // false en localhost, true en producción (https)
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    });

    // Guardamos también el nombre de usuario para mostrarlo luego (esto no es secreto)
    cookies.set("username", strapiData.user.username, {
      path: "/",
      httpOnly: false, 
      maxAge: 60 * 60 * 24 * 7,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ message: "Error de servidor" }), { status: 500 });
  }
};