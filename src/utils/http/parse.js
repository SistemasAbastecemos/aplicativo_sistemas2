/**
 * Devuelve el primer campo con valor de `keys`, o el `fallback`.
 * Cubre los patrones `json.message || fallback`,
 * `json.error || fallback` y `json.error || json.message || fallback`.
 */
export function pickMessage(payload, keys = ["message"], fallback) {
  if (payload) {
    for (const k of keys) {
      if (payload[k]) return payload[k];
    }
  }
  return fallback;
}

/**
 * Desempaqueta el nodo `resultado` si tiene valor; si no, devuelve el
 * objeto tal cual. Mismo criterio de verdad que el código original
 * (`json.resultado ? json.resultado : json`).
 */
export const unwrapResultado = (payload) =>
  payload && payload.resultado ? payload.resultado : payload;

/**
 * Extrae el valor de retorno final a partir del JSON ya validado.
 *   "json"      -> el objeto completo
 *   "data"      -> json.data
 *   "resultado" -> json.resultado ?? json
 *   función     -> selector a medida (p.ej. json => json.trazabilidad)
 */
export function unwrapReturn(json, unwrap) {
  if (typeof unwrap === "function") return unwrap(json);
  switch (unwrap) {
    case "data":
      return json.data;
    case "resultado":
      return unwrapResultado(json);
    case "json":
    default:
      return json;
  }
}

/**
 * Parseo tolerante para respuestas de autenticación que pueden venir
 * vacías o no ser JSON. Reproduce el comportamiento de login/logout.
 */
export async function readTextAsJson(
  response,
  {
    emptyMessage = "El servidor devolvio una respuesta vacia",
    invalidMessage,
  } = {},
) {
  const text = await response.text();
  if (!text || text.trim() === "") throw new Error(emptyMessage);
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(
      invalidMessage ||
        `El servidor no devolvio una respuesta JSON valida. Codigo: ${response.status}`,
    );
  }
}
