/**
 * Convierte una fecha en formato "YYYY-MM-DD" a un Date local (hora fija 12:00
 * para evitar corrimientos por timezone).
 */
export const obtenerFechaLocal = (fechaString) => {
  if (!fechaString) return new Date();
  const fecha = new Date(fechaString + "T12:00:00");
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
};

/**
 * Formatea "YYYY-MM-DD" a "DD/MM/YYYY". Devuelve "" si la fecha no está
 * definida.
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return "";
  const fechaObj = new Date(fecha + "T12:00:00");
  const dia = fechaObj.getDate().toString().padStart(2, "0");
  const mes = (fechaObj.getMonth() + 1).toString().padStart(2, "0");
  const año = fechaObj.getFullYear();
  return `${dia}/${mes}/${año}`;
};

/**
 * Formatea un número a locale es-CO. Tolera null/undefined/NaN devolviendo "0".
 */
export const formatearNumero = (valor) => {
  if (valor === null || valor === undefined) return "0";
  const numero = parseFloat(valor);
  return isNaN(numero) ? "0" : numero.toLocaleString("es-CO");
};

/**
 * Determina si una separata está vigente comparando su fecha final con hoy.
 */
export const esSeparataVigente = (fechaFinal) => {
  if (!fechaFinal) return false;
  const hoy = obtenerFechaLocal(new Date().toISOString().split("T")[0]);
  const fin = obtenerFechaLocal(fechaFinal);
  return hoy <= fin;
};

/**
 * Suma un día a una fecha "YYYY-MM-DD" y la devuelve en el mismo formato.
 */
export const agregarUnDia = (fechaString) => {
  const fecha = new Date(fechaString);
  fecha.setDate(fecha.getDate() + 1);
  return fecha.toISOString().split("T")[0];
};

/**
 * Ordena un objeto de existencias por clave (código de local) ascendente.
 */
export const ordenarExistencias = (existencias) => {
  if (!existencias || typeof existencias !== "object") return {};
  return Object.entries(existencias)
    .sort(([localA], [localB]) => localA.localeCompare(localB))
    .reduce((ordenado, [local, valor]) => {
      ordenado[local] = valor;
      return ordenado;
    }, {});
};
