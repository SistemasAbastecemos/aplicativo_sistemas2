import { STORAGE_PREFIX } from "./constants";

/**
 * Devuelve la fecha de hoy en formato YYYY-MM-DD (compatible con input date).
 */
export const fechaHoy = () => new Date().toISOString().split("T")[0];

/**
 * Lee del localStorage el Set de items marcados como pedido para una
 * fecha. Devuelve un Set vacío si no hay nada guardado o si el JSON
 * está corrupto.
 */
export const leerPedidosGuardados = (fecha) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${fecha}`);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
};

/**
 * Persiste un Set de items marcados como pedido para una fecha.
 */
export const guardarPedidos = (fecha, pedidosSet) => {
  localStorage.setItem(
    `${STORAGE_PREFIX}${fecha}`,
    JSON.stringify([...pedidosSet]),
  );
};

/**
 * Parsea el string de días de pedido (ej. "Lunes,Miércoles,Viernes")
 * a un array limpio. Aplica trim a cada elemento.
 */
export const formatearDias = (diasString) => {
  if (!diasString) return [];
  return diasString
    .split(",")
    .map((d) => d.trim())
    .filter((d) => d !== "");
};
