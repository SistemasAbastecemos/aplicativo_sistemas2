/**
 * Datos de la sede física donde opera este terminal. Estos valores viajan
 * al backend en cada consulta (SEDE_ID) y se muestran arriba en la barra
 * de estado (SEDE_NOMBRE).
 */
export const SEDE_NOMBRE = "Supermercado Belalcazar Vecino";
export const SEDE_ID = "005";

/**
 * Segundos que se muestra la tarjeta del producto/error antes de volver
 * automáticamente a la pantalla de bienvenida.
 */
export const TIEMPO_ESPERA_PANTALLA = 8;

/**
 * Configuración de captura del escáner (input oculto):
 *  - LARGO_MINIMO_CODIGO: si el lector NO envía Enter (típico en Android
 *    con lector integrado), se procesa al pasar la pausa de fin de
 *    escaneo, pero solo si el código tiene al menos esta cantidad de
 *    caracteres. Sube a 13 si quieres exigir EAN-13.
 *  - PAUSA_FIN_ESCANEO: milisegundos sin nuevos caracteres antes de dar
 *    por terminado el escaneo cuando no llega Enter.
 */
export const LARGO_MINIMO_CODIGO = 4;
export const PAUSA_FIN_ESCANEO = 120;

/**
 * Rotación del banner inferior. Cada mensaje rota cada X ms; se generan
 * partículas flotantes con dimensiones/duración aleatorias en cada
 * transición para dar sensación de vida.
 */
export const INTERVALO_ROTACION_BANNER = 7000;
export const CANTIDAD_PARTICULAS = 6;

/**
 * Mensajes rotatorios del banner. Cada uno tiene un badge (label +
 * variante de color) y un texto. Agregar/quitar mensajes es una entrada
 * en este array — el hook los cicla módulo la longitud.
 */
export const MENSAJES_BANNER = [
  {
    badge: "💡 TIPS",
    variante: "tips",
    texto:
      "¿Sabías que? En Supermercado Belalcázar estamos trabajando en el futuro con nuestro más grande proyecto Siembra, una evolución de nuestro sistema.",
  },
  {
    badge: "✓ ACTIVO",
    variante: "activo",
    texto:
      "Ahorra en tus compras en la línea pescados y mariscos con los descuentos de todos los martes y jueves.",
  },
  {
    badge: "⭐ EXCLUSIVO",
    variante: "exclusivo",
    texto:
      "¡Recuerda que todos los martes son Martes de Plaza, aprovecha todos nuestros descuentos!",
  },
];
