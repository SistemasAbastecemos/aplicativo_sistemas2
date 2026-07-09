import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Recaudos.module.css";
import { COLUMNAS_TABLA } from "../utils/constants";
import { formatearMoneda } from "../utils/helpers";

/**
 * Tabla de resultados con sorting clickeable en encabezados. Cada columna
 * está definida declarativamente en COLUMNAS_TABLA — agregar/renombrar
 * columnas es tocar un solo lugar.
 *
 * Presentacional: recibe datos ya paginados y ordenados desde el pipeline.
 *
 * En móvil, la tabla se convierte en cards apiladas usando data-label
 * (definido en el CSS responsive).
 */
const RecaudosTable = ({ datos, orden, onSolicitarOrden }) => {
  const getIconoOrden = (columna) => {
    if (orden.columna !== columna) return faSort;
    return orden.direccion === "asc" ? faSortUp : faSortDown;
  };

  return (
    <div className={styles.tablaWrapper}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            {COLUMNAS_TABLA.map((col) => (
              <th
                key={col.key}
                className={`${styles.thSortable} ${
                  col.align === "right" ? styles.columnaNumerica : ""
                }`}
                onClick={() => col.sortable && onSolicitarOrden(col.key)}
              >
                {col.label}{" "}
                {col.sortable && (
                  <FontAwesomeIcon
                    icon={getIconoOrden(col.key)}
                    className={`${styles.sortIcon} ${
                      orden.columna === col.key ? styles.active : ""
                    }`}
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datos.length === 0 ? (
            <tr>
              <td colSpan={COLUMNAS_TABLA.length} className={styles.emptyRow}>
                No se encontraron coincidencias para la búsqueda.
              </td>
            </tr>
          ) : (
            datos.map((row, index) => (
              <tr key={`${row.documento_fc}-${index}`} className={styles.tableRow}>
                {COLUMNAS_TABLA.map((col) => {
                  let className = "";
                  if (col.moneda) className = styles.columnaMoneda;
                  else if (col.bold) className = styles.columnaFuerte;
                  else if (col.align === "right") className = styles.columnaNumerica;

                  const valor = col.moneda
                    ? formatearMoneda(row[col.key])
                    : row[col.key];

                  return (
                    <td
                      key={col.key}
                      className={className}
                      data-label={col.label}
                    >
                      {valor}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecaudosTable;
