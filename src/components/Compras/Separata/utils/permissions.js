/**
 * Listas blancas de usuarios con capacidades administrativas específicas del
 * módulo de separatas. La comparación es case-insensitive: podés escribir
 * cada login como te sea más natural (mayúsculas, minúsculas o mezclado)
 * porque el helper `perteneceA` normaliza ambos lados antes de comparar.
 */

// Pueden editar el título de la separata y la fecha límite de edición.
export const USUARIOS_EDITORES_META = [
  "LORENA",
  "JEFFERSON",
  "LUISAF",
  "Jonathan",
];

// Pueden editar/eliminar items incluso cuando la fecha límite de edición
// ya venció.
export const USUARIOS_EDITORES_ITEMS = [
  "LORENA",
  "LUISAF",
  "JEFFERSON",
  "JAZMIN",
  "JAVID",
  "OSCARG",
  "Liseth",
  "DUVER",
  "ANDREA",
  "NINI",
];

/**
 * Helper interno: chequea si un login pertenece a una lista, ignorando
 * mayúsculas/minúsculas en ambos lados de la comparación.
 */
const perteneceA = (lista, login) => {
  if (!login) return false;
  const loginNormalizado = login.toUpperCase();
  return lista.some((usuario) => usuario.toUpperCase() === loginNormalizado);
};

export const puedeEditarMeta = (login) =>
  perteneceA(USUARIOS_EDITORES_META, login);

export const puedeEditarItems = (login) =>
  perteneceA(USUARIOS_EDITORES_ITEMS, login);

/**
 * Determina si la fecha límite de edición de una separata ya venció.
 */
export const haPasadoFechaLimite = (separata) =>
  !!separata?.fecha_limite_edicion &&
  new Date() > new Date(separata.fecha_limite_edicion);
