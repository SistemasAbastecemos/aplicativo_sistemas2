/**
 * Formatea un número como pesos colombianos sin decimales (los precios
 * de venta en Colombia no tienen centavos).
 */
export const formatearDinero = (valor) => {
  if (typeof valor !== "number" || isNaN(valor)) return "0";
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
};

/**
 * Devuelve la fecha/hora actual formateada en español colombiano y en
 * MAYÚSCULAS para el display de kiosco.
 * Ejemplo: "MIÉRCOLES, 8 DE OCTUBRE DE 2025, 03:45:22 P. M."
 */
export const formatearFechaHora = () => {
  const opciones = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };
  return new Date().toLocaleDateString("es-CO", opciones).toUpperCase();
};
