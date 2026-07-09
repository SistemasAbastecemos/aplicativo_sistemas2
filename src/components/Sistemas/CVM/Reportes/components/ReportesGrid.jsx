import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faSyncAlt,
  faSearch,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Reportes.module.css";
import EmptyState from "../../../../UI/EmptyState";
import RegistroCard from "./RegistroCard";

/**
 * Cuadrícula de tarjetas de registros con paginación. Cuando no hay
 * resultados, muestra el EmptyState global con un botón para restablecer
 * filtros. El texto y el ícono cambian según si el vacío viene de una
 * búsqueda activa o del catálogo mismo.
 */
const ReportesGrid = ({
  registros,
  hayBusqueda,
  searchTrimmed,
  selectedId,
  onSelect,
  onViewImages,
  currentPage,
  totalPages,
  onPageChange,
  onResetFilters,
}) => {
  if (registros.length === 0) {
    return (
      <EmptyState
        icon={hayBusqueda ? faSearch : faClipboardList}
        title={
          hayBusqueda ? "Sin coincidencias" : "No hay registros disponibles"
        }
        description={
          hayBusqueda
            ? `No se encontraron registros que coincidan con "${searchTrimmed}".`
            : "No se encontraron datos con los filtros actuales."
        }
      >
        <button
          className={styles.resetButton}
          onClick={onResetFilters}
          type="button"
        >
          <FontAwesomeIcon icon={faSyncAlt} />
          Restablecer filtros
        </button>
      </EmptyState>
    );
  }

  return (
    <>
      <div className={styles.registrosGrid}>
        {registros.map((registro) => (
          <RegistroCard
            key={registro.id_registro}
            registro={registro}
            isSelected={selectedId === registro.id_registro}
            onSelect={onSelect}
            onViewImages={onViewImages}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            type="button"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
            Anterior
          </button>

          <div className={styles.paginationInfo}>
            Página <strong>{currentPage}</strong> de {totalPages}
          </div>

          <button
            className={styles.paginationButton}
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            type="button"
          >
            Siguiente
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </>
  );
};

export default ReportesGrid;
