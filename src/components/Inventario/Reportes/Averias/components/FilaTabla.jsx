import React from "react";
import styles from "../ExistenciasAverias.module.css";
import { COLUMNAS_TABLA } from "../utils/constants";
import { formatearCOP, formatearNumero } from "../utils/helpers";

/**
 * Renderiza una fila de la tabla de resultados iterando sobre
 * COLUMNAS_TABLA. Cada celda aplica modificadores visuales (truncate,
 * bold, formato numérico, moneda, badge) según la config de la columna.
 *
 * En móvil, cada `<td>` tiene `data-label` con el label de la columna
 * para el reflow a cards apiladas (definido en el CSS responsive).
 */
const FilaTabla = ({ item }) => (
  <tr>
    {COLUMNAS_TABLA.map((col) => {
      const valor = item[col.key];

      let contenido = valor;
      if (col.numero) contenido = formatearNumero(valor);
      else if (col.moneda) contenido = formatearCOP(valor);
      else if (col.badge) {
        contenido = (
          <span
            className={valor === "Si" ? styles.badgeSi : styles.badgeNo}
          >
            {valor}
          </span>
        );
      }

      const classNames = [];
      if (col.truncate) classNames.push(styles.celdaTruncada);
      if (col.bold) classNames.push(styles.textoDestacado);
      if (col.numero || col.moneda) classNames.push(styles.numeroAlineado);
      if (col.align === "center") classNames.push(styles.celdaCentrada);

      return (
        <td
          key={col.key}
          className={classNames.join(" ")}
          title={col.truncate ? valor : undefined}
          data-label={col.label}
        >
          {contenido}
        </td>
      );
    })}
  </tr>
);

export default FilaTabla;
