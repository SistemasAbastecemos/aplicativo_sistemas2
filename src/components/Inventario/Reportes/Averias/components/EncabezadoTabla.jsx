import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../ExistenciasAverias.module.css";
import { COLUMNAS_TABLA } from "../utils/constants";

/**
 * Encabezado de la tabla. Genera los `<th>` iterando sobre COLUMNAS_TABLA.
 * Las columnas ordenables muestran un ícono que rota según la dirección
 * del sort activo.
 */
const EncabezadoTabla = ({ sortConfig, onSort }) => {
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return faSort;
    return sortConfig.direction === "asc" ? faSortUp : faSortDown;
  };

  return (
    <thead>
      <tr>
        {COLUMNAS_TABLA.map((col) => {
          const style = { cursor: col.sortable ? "pointer" : "default" };
          if (col.align === "right") style.textAlign = "right";
          if (col.align === "center") style.textAlign = "center";

          return (
            <th
              key={col.key}
              onClick={col.sortable ? () => onSort(col.key) : undefined}
              style={style}
            >
              <span>{col.label}</span>
              {col.sortable && (
                <FontAwesomeIcon
                  icon={getSortIcon(col.key)}
                  className={styles.sortIcon}
                />
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
};

export default EncabezadoTabla;
