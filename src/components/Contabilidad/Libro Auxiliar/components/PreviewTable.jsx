import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../LibroAuxiliar.module.css";
import { formatearCOP } from "../utils/helpers";

/**
 * Preview de los primeros N registros por página. La tabla en desktop
 * se ve normal; en móvil, cada fila se convierte en card apilada usando
 * `data-label` (definido en el CSS).
 *
 * Nota: la preview NO muestra TODAS las columnas del reporte — solo las 7
 * más importantes para dar contexto. Al exportar, se incluyen las 22.
 */
const PreviewTable = ({
  items,
  paginaActual,
  totalPaginas,
  onPageChange,
}) => (
  <section className={styles.previewContainer}>
    <div className={styles.tableWrapper}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>C.O.</th>
            <th>Cuenta</th>
            <th>Desc. Cuenta</th>
            <th>Tercero</th>
            <th>Fecha</th>
            <th>Documento</th>
            <th className={styles.rightAlign}>Valor Débito</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, index) => (
            <tr key={index} className={styles.tableRow}>
              <td data-label="C.O.">{row.doc_fc_co}</td>
              <td className={styles.bold} data-label="Cuenta">
                {row.id_cuenta}
              </td>
              <td data-label="Desc. Cuenta">{row.desc_cuenta}</td>
              <td data-label="Tercero">
                {row.terc} - {row.desc_proveedor}
              </td>
              <td data-label="Fecha">{`${row.ano}-${row.mes}-${row.dia}`}</td>
              <td data-label="Documento">
                {row.doc_fc_tipo} {row.documento_fc}
              </td>
              <td
                className={`${styles.rightAlign} ${styles.valorCell}`}
                data-label="Valor Débito"
              >
                {formatearCOP(row.valor_deb)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {totalPaginas > 1 && (
      <div className={styles.pagination}>
        <button
          className={styles.paginationButton}
          onClick={() => onPageChange(Math.max(1, paginaActual - 1))}
          disabled={paginaActual === 1}
          type="button"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
          Anterior
        </button>
        <span className={styles.paginationInfo}>
          Página <strong>{paginaActual}</strong> de {totalPaginas}
        </span>
        <button
          className={styles.paginationButton}
          onClick={() =>
            onPageChange(Math.min(totalPaginas, paginaActual + 1))
          }
          disabled={paginaActual >= totalPaginas}
          type="button"
        >
          Siguiente
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    )}
  </section>
);

export default PreviewTable;
