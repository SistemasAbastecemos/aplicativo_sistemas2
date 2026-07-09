/**
 * Formatea un número como moneda colombiana (COP). Usado tanto en la
 * preview como en el total general.
 */
export const formatearCOP = (valor) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  }).format(valor || 0);

/**
 * Divide un rango de fechas en lapsos mensuales, respetando los bordes
 * del rango original. Ej: 2024-01-15 → 2024-03-10 produce:
 *  - 2024-01-15 → 2024-01-31 (etiqueta "2024-01")
 *  - 2024-02-01 → 2024-02-29 (etiqueta "2024-02")
 *  - 2024-03-01 → 2024-03-10 (etiqueta "2024-03")
 *
 * Se usa para que el backend no reciba consultas sobre rangos enormes;
 * cada mes va como llamada separada al API.
 */
export const generarLapsosMensuales = (inicio, fin) => {
  const lapsos = [];
  let fechaActual = new Date(inicio + "T00:00:00");
  const fechaFin = new Date(fin + "T00:00:00");

  while (fechaActual <= fechaFin) {
    const y = fechaActual.getFullYear();
    const m = fechaActual.getMonth();
    let primerDia = new Date(y, m, 1);
    if (primerDia < new Date(inicio + "T00:00:00")) {
      primerDia = new Date(inicio + "T00:00:00");
    }
    let ultimoDia = new Date(y, m + 1, 0);
    if (ultimoDia > fechaFin) {
      ultimoDia = fechaFin;
    }
    lapsos.push({
      inicio: primerDia.toISOString().split("T")[0],
      fin: ultimoDia.toISOString().split("T")[0],
      etiqueta: `${y}-${String(m + 1).padStart(2, "0")}`,
    });
    fechaActual = new Date(y, m + 1, 1);
  }
  return lapsos;
};

/**
 * Convierte una URL o data URI a base64. Se usa para embeber el logo
 * corporativo en el Excel exportado. Devuelve null si falla la carga
 * (el Excel se genera igual sin logo en ese caso).
 */
export const getBase64ImageFromUrl = async (imageSource) => {
  try {
    if (imageSource.startsWith("data:image")) return imageSource;
    const res = await fetch(imageSource);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result), false);
      reader.addEventListener("error", () =>
        reject(new Error("Fallo al procesar imagen corporativa")),
      );
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    return null;
  }
};

/**
 * Ordena los registros primero por tercero (ascendente) y dentro de cada
 * tercero por fecha descendente. Se usa después de acumular todos los
 * lapsos mensuales antes de mostrar la preview.
 */
export const ordenarRegistros = (registros) =>
  [...registros].sort((a, b) => {
    if (a.terc !== b.terc) return a.terc.localeCompare(b.terc);
    const fA = `${a.ano}${a.mes.padStart(2, "0")}${a.dia.padStart(2, "0")}`;
    const fB = `${b.ano}${b.mes.padStart(2, "0")}${b.dia.padStart(2, "0")}`;
    return fB.localeCompare(fA);
  });
