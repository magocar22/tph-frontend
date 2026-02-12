// src/pages/api/login.ts
import type { APIRoute } from "astro";
import { WP_URL } from "../../lib/wordpress";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // 1) Leer JSON de forma segura
    let data: any;
    try {
      data = await request.json();
    } catch {
      return new Response(JSON.stringify({ message: "Body JSON inválido" }), { status: 400 });
    }

    const identifierRaw = data?.identifier;
    const passwordRaw = data?.password;

    const identifier = typeof identifierRaw === "string" ? identifierRaw.trim() : "";
    const password = typeof passwordRaw === "string" ? passwordRaw : "";

    if (!identifier || !password) {
      return new Response(JSON.stringify({ message: "Faltan datos" }), { status: 400 });
    }

    // 2) Limpiar la URL base
    const baseUrl = WP_URL.replace(/\/$/, "");

    // 3) Petición al WordPress (JWT Auth) con timeout
    const controller = new AbortController();
    const timeoutMs = 8000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let wpRes: Response;
    try {
      wpRes = await fetch(`${baseUrl}/wp-json/jwt-auth/v1/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: identifier,
          password,
        }),
        signal: controller.signal,
      });
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return new Response(
          JSON.stringify({ message: "El servidor está tardando demasiado en responder." }),
          { status: 504 }
        );
      }
      console.error("Login fetch error:", err);
      return new Response(JSON.stringify({ message: "Error interno de conexión" }), { status: 500 });
    } finally {
      clearTimeout(timeout);
    }

    // 4) Parseo seguro de respuesta WP
    let wpData: any;
    try {
      wpData = await wpRes.json();
    } catch {
      return new Response(JSON.stringify({ message: "Respuesta inválida del servidor" }), {
        status: 502,
      });
    }

    // 5) Validación de respuesta
    if (!wpRes.ok || !wpData?.token) {
      return new Response(
        JSON.stringify({
          message: wpData?.message || "Usuario o contraseña incorrectos",
        }),
        { status: 401 }
      );
    }

    // 6) Configuración de cookies (seguridad)
    const isProd = import.meta.env.PROD;

    // 1 semana
    const maxAge = 60 * 60 * 24 * 7;
    const expires = new Date(Date.now() + maxAge * 1000);

    // Token JWT (HttpOnly)
    cookies.set("wp_jwt", wpData.token, {
      path: "/",
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge,
      expires,
    });

    // Nombre visible para UI (NO es crítico; solo display)
    cookies.set("wp_user_display", wpData.user_display_name || "", {
      path: "/",
      httpOnly: false,
      secure: isProd,
      sameSite: "strict",
      maxAge,
      expires,
    });

    return new Response(JSON.stringify({ success: true, user: wpData.user_display_name }), {
      status: 200,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return new Response(JSON.stringify({ message: "Error interno de conexión" }), { status: 500 });
  }
};
