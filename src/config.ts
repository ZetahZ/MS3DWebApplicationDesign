// Configuración global del sitio.
// Cambiando estos valores acá se actualizan en toda la app (botón flotante,
// página de contacto, formularios que abren WhatsApp, etc.)

export const WHATSAPP_NUMBER = "5493874839783";
export const WHATSAPP_DISPLAY = "+54 9 387 483-9783";

export function whatsappUrl(
  mensaje = "Hola M's3D! Quiero hacer una consulta.",
): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
}

// src/config.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';