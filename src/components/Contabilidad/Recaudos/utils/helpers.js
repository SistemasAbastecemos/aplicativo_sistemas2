/**
 * Formatea un número como moneda colombiana (COP) sin decimales.
 */
export const formatearMoneda = (valor) => {
  const numero = parseFloat(valor) || 0;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numero);
};

/**
 * Formatea un entero con separadores de miles en formato colombiano.
 * Usado para mostrar la cantidad de registros filtrados.
 */
export const formatearEntero = (valor) =>
  new Intl.NumberFormat("es-CO").format(valor);
