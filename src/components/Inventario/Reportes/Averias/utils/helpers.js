/**
 * Formatea un valor como moneda colombiana (COP) sin decimales.
 */
export const formatearCOP = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor || 0);

/**
 * Formatea un valor como número decimal con 2 decimales (para existencias).
 */
export const formatearNumero = (valor) => parseFloat(valor || 0).toFixed(2);

/**
 * Normaliza el código de una sede al formato de 3 dígitos (padding con
 * ceros a la izquierda). Los datos de sedes vienen con distintos nombres
 * de campo según el endpoint: `co_siesa`, `codigo` o `id_co` — se toma
 * el primero disponible.
 */
export const normalizarCodigoSede = (sede) => {
  const raw = sede.co_siesa || sede.codigo || sede.id_co;
  return String(raw).trim().padStart(3, "0");
};

/**
 * Extrae de un array de datos los valores únicos ordenados alfabéticamente
 * de una columna. Filtra vacíos y nulls antes de deduplicar.
 */
export const extraerCatalogoUnico = (datos, campo) => {
  const set = new Set();
  datos.forEach((el) => {
    if (el[campo] != null && el[campo] !== "") {
      set.add(String(el[campo]));
    }
  });
  return Array.from(set).sort((a, b) =>
    String(a).localeCompare(String(b)),
  );
};
