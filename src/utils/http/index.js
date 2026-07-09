/**
 * Punto de entrada del cliente HTTP. `api.js` (y cualquier otro consumidor)
 * importa desde aquí, sin conocer la estructura interna de los archivos.
 */
export { API_BASE_URL } from "./config.js";
export { ApiError } from "./ApiError.js";
export { getToken, buildHeaders } from "./headers.js";
export { buildUrl } from "./url.js";
export {
  pickMessage,
  unwrapResultado,
  unwrapReturn,
  readTextAsJson,
} from "./parse.js";
export { fetchWithTimeout, request, runResultadoReport } from "./client.js";
