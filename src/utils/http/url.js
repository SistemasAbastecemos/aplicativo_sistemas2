import { API_BASE_URL } from "./config.js";

/**
 * Une la ruta (relativa a API_BASE_URL) con los parámetros de query,
 * respetando un `?` que ya venga en la ruta.
 *
 *   buildUrl("/sedes/get.php")                 -> ".../sedes/get.php"
 *   buildUrl("/x.php", { a: 1, b: 2 })         -> ".../x.php?a=1&b=2"
 *   buildUrl("/x.php?action=y", { a: 1 })      -> ".../x.php?action=y&a=1"
 *
 * `params` puede ser un objeto plano o una URLSearchParams.
 */
export function buildUrl(path, params) {
  const base = `${API_BASE_URL}${path}`;
  if (!params) return base;

  const qs =
    params instanceof URLSearchParams
      ? params.toString()
      : new URLSearchParams(params).toString();

  if (!qs) return base;
  return base.includes("?") ? `${base}&${qs}` : `${base}?${qs}`;
}
