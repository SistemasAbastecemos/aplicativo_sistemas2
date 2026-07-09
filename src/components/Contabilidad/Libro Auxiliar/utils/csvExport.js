import { saveAs } from "file-saver";
import { COLUMNAS_EXPORT } from "./constants";

/**
 * Genera y descarga un archivo CSV con los datos del libro auxiliar.
 *
 * Detalles del formato preservados del legacy:
 *  - BOM (\uFEFF) al inicio para que Excel abra bien con acentos
 *  - Separador `;` (formato colombiano)
 *  - Campos de texto libre entre comillas dobles
 *  - Nombre del archivo: Libro_Auxiliar_{empresa}_{timestamp}.csv
 */
export const exportarCSV = ({ datos, filtros }) => {
  const encabezados = COLUMNAS_EXPORT.map((c) => c.labelCsv);

  const filas = datos.map((row) =>
    COLUMNAS_EXPORT.map((col) => {
      const valor = row[col.key];
      if (col.quoteCsv) return `"${valor ?? ""}"`;
      return valor ?? "";
    }).join(";"),
  );

  const csvContent = "\uFEFF" + [encabezados.join(";"), ...filas].join("\n");
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  saveAs(
    blob,
    `Libro_Auxiliar_${filtros.empresa}_${new Date().getTime()}.csv`,
  );
};
