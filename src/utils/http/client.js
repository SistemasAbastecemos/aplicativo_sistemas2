import { ApiError } from "./ApiError.js";
import { buildHeaders, getToken } from "./headers.js";
import { buildUrl } from "./url.js";
import { pickMessage, unwrapResultado, unwrapReturn } from "./parse.js";

/**
 * fetch con timeout opcional y encadenamiento de un AbortSignal externo.
 * No mapea el AbortError: eso lo decide quien llama (los mensajes varían).
 */
export async function fetchWithTimeout(
  url,
  init,
  { timeout, externalSignal } = {},
) {
  if (!timeout && !externalSignal) return fetch(url, init);

  const controller = new AbortController();
  const timeoutId = timeout
    ? setTimeout(() => controller.abort(), timeout)
    : null;

  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else
      externalSignal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
  }

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/**
 * Punto único de acceso HTTP. Cubre la inmensa mayoría de los endpoints.
 * Los casos verdaderamente especiales (login por texto, subida por chunks,
 * descarga de blob, reportes con timeout largo, mapeos a medida) usan las
 * primitivas exportadas (buildUrl, buildHeaders, etc.) directamente.
 *
 * Opciones:
 *   method, params, body, auth, tokenArg, requireToken, contentTypeJson,
 *   accept, headers(extra), statusMessages, check, messageKeys, errorMessage,
 *   okBeforeParse, okErrorMessage, unwrap
 *
 *   check:
 *     "success"     -> exige json.success
 *     "ok"          -> exige response.ok
 *     "ok+success"  -> exige ambos
 *     "error-field" -> lanza si json.error tiene valor
 *     "none"        -> no valida (retorna crudo)
 */
export async function request(path, opts = {}) {
  const {
    method = "GET",
    params,
    body,
    auth = "required",
    tokenArg,
    requireToken = false,
    contentTypeJson = true,
    accept = false,
    headers: extra = {},
    statusMessages, // { 403: "..." } evaluado ANTES de parsear
    check = "success",
    messageKeys = ["message"],
    errorMessage,
    okBeforeParse = false, // valida response.ok ANTES de leer el cuerpo
    okErrorMessage, // string | (status) => string  (usado con okBeforeParse)
    unwrap = "json",
  } = opts;

  if (requireToken && !getToken()) {
    throw new Error("No hay token de autenticacion");
  }

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const init = {
    method,
    headers: buildHeaders({
      auth,
      tokenArg,
      // Con FormData el navegador debe fijar el boundary: nunca forzamos JSON.
      contentTypeJson: isFormData ? false : contentTypeJson,
      accept,
      extra,
    }),
  };

  if (body !== undefined && body !== null) {
    init.body =
      isFormData || typeof body === "string" ? body : JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, params), init);

  // Chequeos por código de estado ANTES de parsear (p.ej. 403 sin cuerpo JSON).
  if (statusMessages && statusMessages[response.status]) {
    throw new Error(statusMessages[response.status]);
  }

  if (okBeforeParse && !response.ok) {
    const msg =
      typeof okErrorMessage === "function"
        ? okErrorMessage(response.status)
        : okErrorMessage || `Error HTTP: ${response.status}`;
    throw new Error(msg);
  }

  const json = await response.json();

  if (check === "success" && !json.success) {
    throw new ApiError(pickMessage(json, messageKeys, errorMessage), {
      status: response.status,
      payload: json,
    });
  } else if (check === "ok" && !response.ok) {
    throw new ApiError(pickMessage(json, messageKeys, errorMessage), {
      status: response.status,
      payload: json,
    });
  } else if (check === "ok+success" && (!response.ok || !json.success)) {
    throw new ApiError(pickMessage(json, messageKeys, errorMessage), {
      status: response.status,
      payload: json,
    });
  } else if (check === "error-field" && json.error) {
    throw new ApiError(json.error, { status: response.status, payload: json });
  }

  return unwrapReturn(json, unwrap);
}

/**
 * Reporte pesado con timeout largo y desempaquetado de `resultado`.
 * Usado por obtenerReporteRecaudos y obtenerDatosAuxiliar.
 */
export async function runResultadoReport(
  path,
  filtros,
  { timeout, statusMessage, successFallback, abortMessage } = {},
) {
  try {
    const response = await fetchWithTimeout(
      buildUrl(path),
      {
        method: "POST",
        headers: buildHeaders({ auth: "optional" }),
        body: JSON.stringify(filtros),
      },
      { timeout },
    );

    if (!response.ok) {
      throw new Error(
        typeof statusMessage === "function"
          ? statusMessage(response.status)
          : statusMessage,
      );
    }

    const data = unwrapResultado(await response.json());
    if (!data.success) {
      throw new Error(pickMessage(data, ["message"], successFallback));
    }
    return data;
  } catch (error) {
    if (error.name === "AbortError" && abortMessage) {
      throw new Error(abortMessage);
    }
    throw error;
  }
}
