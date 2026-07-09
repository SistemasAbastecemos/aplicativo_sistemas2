import { ANIO_MIN, ANIO_MAX } from "./constants";

/**
 * Valida que un valor sea un año dentro del rango permitido.
 * Retorna el año como entero si es válido, o null en caso contrario.
 */
export const parseAnioValido = (raw) => {
  const anio = parseInt(raw);
  if (!anio || anio < ANIO_MIN || anio > ANIO_MAX) return null;
  return anio;
};

/**
 * Formatea el tamaño de un archivo en MB con 2 decimales.
 */
export const formatearTamanoMB = (bytes) => (bytes / 1024 / 1024).toFixed(2);

/**
 * Determina si el usuario tiene privilegios de administrador para este
 * módulo. Preserva la regla legacy: rol=admin o área=SISTEMAS.
 */
export const esAdmin = (user) =>
  user?.rol === "admin" || user?.area_nombre?.toUpperCase() === "SISTEMAS";
