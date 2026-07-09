/**
 * Lectura del token de sesión. Punto único: si algún día cambia el
 * almacenamiento (cookie, sessionStorage, etc.) solo se toca aquí.
 */
export const getToken = () => localStorage.getItem("authToken");

/**
 * Construye las cabeceras según el modo de autenticación.
 *   auth:
 *     "required" -> Bearer <token>       (equivale a `Bearer ${localStorage...}`)
 *     "optional" -> Bearer <token> ó ""  (equivale a `token ? ... : ""`)
 *     "arg"      -> Bearer <tokenArg>    (token recibido por parámetro)
 *     "none"     -> sin cabecera Authorization
 *
 *   contentTypeJson -> añade "Content-Type: application/json"
 *   accept          -> añade "Accept: application/json"
 *   extra           -> cabeceras adicionales que sobreescriben lo anterior
 */
export function buildHeaders({
  auth = "required",
  tokenArg,
  contentTypeJson = true,
  accept = false,
  extra = {},
} = {}) {
  const headers = {};
  if (contentTypeJson) headers["Content-Type"] = "application/json";
  if (accept) headers["Accept"] = "application/json";

  if (auth === "required") {
    headers.Authorization = `Bearer ${getToken()}`;
  } else if (auth === "optional") {
    const t = getToken();
    headers.Authorization = t ? `Bearer ${t}` : "";
  } else if (auth === "arg") {
    headers.Authorization = `Bearer ${tokenArg}`;
  }
  // auth === "none": no se añade Authorization

  return { ...headers, ...extra };
}
