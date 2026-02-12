import type { APIRoute } from "astro";
import { WP_URL } from "../../lib/wordpress";

// =================================================================
// 🛡️ CONFIGURACIÓN DE SEGURIDAD
// =================================================================

// 1. ALLOWLIST: Solo aceptamos estos IDs de formulario
// (Añade aquí los IDs de CF7 que vayas creando)
const ALLOWED_FORMS = [
  "8079e0a", // Contacto General / Inversores
  "fd93142", // Futuro Estudio de Solvencia
];

// 2. REGLAS DE ARCHIVOS
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "application/pdf", 
  "image/jpeg", 
  "image/png", 
  "image/webp"
];
const WP_TIMEOUT_MS = 8000;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    
    // ---------------------------------------------------------
    // 🕵️ 1. DEFENSA ANTI-SPAM (HONEYPOT)
    // ---------------------------------------------------------
    // Si el campo trampa '_honey' tiene valor, es un bot.
    const honeyPot = formData.get("_honey");
    if (honeyPot) {
      // Devolvemos éxito falso para confundir al bot
      return new Response(JSON.stringify({
        success: true, 
        message: "Enviado." 
      }), { status: 200 });
    }
    // Lo eliminamos para no ensuciar el envío a WP
    formData.delete("_honey");


    // ---------------------------------------------------------
    // 🔒 2. VALIDACIÓN DE ID (ALLOWLIST)
    // ---------------------------------------------------------
    const formId = formData.get("_fid")?.toString();

    if (!formId || !ALLOWED_FORMS.includes(formId)) {
      return new Response(JSON.stringify({
        success: false,
        message: "Error de seguridad: Formulario no autorizado."
      }), { status: 403 }); // Forbidden
    }

    // ---------------------------------------------------------
    // 📁 3. VALIDACIÓN DE ARCHIVOS (Si los hay)
    // ---------------------------------------------------------
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        // Ignoramos archivos vacíos (input file sin selección)
        if (value.size === 0) continue;

        // Validar tamaño
        if (value.size > MAX_FILE_SIZE) {
          return new Response(JSON.stringify({
            success: false,
            message: `El archivo ${value.name} es demasiado grande. Máx 5MB.`
          }), { status: 400 });
        }

        // Validar tipo
        if (!ALLOWED_MIME_TYPES.includes(value.type)) {
          return new Response(JSON.stringify({
            success: false,
            message: `Formato no permitido en ${value.name}. Solo PDF e Imágenes.`
          }), { status: 400 });
        }
      }
    }

    // ---------------------------------------------------------
    // 🚀 4. ENVÍO A WORDPRESS
    // ---------------------------------------------------------
    const endpoint = `${WP_URL}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), WP_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
    } catch (error: any) {
      if (error?.name === "AbortError") {
        return new Response(JSON.stringify({
          success: false,
          message: "El servidor está tardando demasiado. Inténtalo de nuevo."
        }), { status: 504 });
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }

    const data = await res.json();

    // ---------------------------------------------------------
    // 📢 5. NORMALIZACIÓN DE RESPUESTA
    // ---------------------------------------------------------
    if (!res.ok || data.status !== 'mail_sent') {
      // Filtramos mensajes técnicos feos de WP
      let userMessage = "Error al enviar el formulario.";
      
      if (data.status === 'validation_failed') userMessage = "Revisa los campos obligatorios.";
      if (data.status === 'spam') userMessage = "El sistema ha detectado spam.";
      if (data.status === 'mail_failed') userMessage = "No hemos podido enviar tu mensaje. Inténtalo de nuevo.";
      if (!res.ok && !data.status) userMessage = "No hemos podido procesar tu solicitud ahora mismo.";

      return new Response(JSON.stringify({
        success: false,
        message: userMessage
      }), { status: 400 });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Formulario enviado correctamente."
    }), { status: 200 });

  } catch (error: any) {
    console.error(`[API Forms Error]: ${error.message}`);
    return new Response(JSON.stringify({
      success: false,
      message: "Error interno del servidor. Inténtalo más tarde."
    }), { status: 500 });
  }
};
