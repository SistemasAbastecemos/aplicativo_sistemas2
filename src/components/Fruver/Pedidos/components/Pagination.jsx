import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Pedidos.module.css";
import { MAX_PAGINATION_BUTTONS } from "../utils/constants";

/**
 * Genera el rango de páginas visibles [startPage, endPage] centrado
 * en la página actual, con máximo MAX_PAGINATION_BUTTONS botones.
 */
const calcularRango = (paginaActual, totalPages) => {
  let startPage = Math.max(
    1,
    paginaActual - Math.floor(MAX_PAGINATION_BUTTONS / 2),
  );
  let endPage = Math.min(totalPages, startPage + MAX_PAGINATION_BUTTONS - 1);
  if (endPage - startPage + 1 < MAX_PAGINATION_BUTTONS) {
    startPage = Math.max(1, endPage - MAX_PAGINATION_BUTTONS + 1);
  }
  return { startPage, endPage };
};

/**
 * Paginación con:
 *  - Botón anterior/siguiente (deshabilitados en los extremos)
 *  - Botones numerados centrados en la página actual (máx 5)
 *  - Ellipsis "..." cuando hay páginas fuera del rango visible
 *  - Info textual "Página X de N"
 */
const Pagination = ({ paginaActual, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const { startPage, endPage } = calcularRango(paginaActual, totalPages);
  const paginas = [];
  for (let i = startPage; i <= endPage; i++) paginas.push(i);

  return (
    <div className={styles.pagination}>
      <button
        className={styles.paginationButton}
        onClick={() => onPageChange(paginaActual - 1)}
        disabled={paginaActual === 1}
        type="button"
      >
        <FontAwesomeIcon icon={faChevronLeft} />
        <span>Anterior</span>
      </button>

      <div className={styles.paginationNumbers}>
        {startPage > 1 && (
          <>
            <button
              className={styles.paginationButton}
              onClick={() => onPageChange(1)}
              type="button"
            >
              1
            </button>
            {startPage > 2 && (
              <span className={styles.paginationEllipsis}>
                <FontAwesomeIcon icon={faEllipsisH} />
              </span>
            )}
          </>
        )}

        {paginas.map((p) => (
          <button
            key={p}
            className={`${styles.paginationButton} ${
              p === paginaActual ? styles.paginationButtonActive : ""
            }`}
            onClick={() => onPageChange(p)}
            type="button"
          >
            {p}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className={styles.paginationEllipsis}>
                <FontAwesomeIcon icon={faEllipsisH} />
              </span>
            )}
            <button
              className={styles.paginationButton}
              onClick={() => onPageChange(totalPages)}
              type="button"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        className={styles.paginationButton}
        onClick={() => onPageChange(paginaActual + 1)}
        disabled={paginaActual === totalPages}
        type="button"
      >
        <span>Siguiente</span>
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
};

export default Pagination;
