import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faBuilding,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Sedes.module.css";
import SedeCard from "./SedeCard";
import EmptyState from "../../../UI/EmptyState";

/**
 * Cuadrícula de sedes. Muestra el estado vacío global cuando no hay resultados y,
 * en caso contrario, las tarjetas y la paginación.
 */
const SedesGrid = ({
  sedesFiltradas,
  search,
  onEdit,
  onCreate,
  pagina,
  totalPaginas,
  onPaginaChange,
}) => {
  // Manejo del estado vacío adaptado al componente global, agnóstico y composable
  if (sedesFiltradas.length === 0) {
    const hayBusqueda = !!search;

    return (
      <EmptyState
        icon={faBuilding}
        title={
          hayBusqueda ? "No se encontraron sedes" : "No hay sedes registradas"
        }
        description={
          hayBusqueda
            ? `No se encontraron sedes que coincidan con "${search.trim()}". Intenta con otro término.`
            : "Puedes crear una nueva usando el botón de apertura."
        }
      >
        {/* Inyección dinámica del botón mediante composición (children) */}
        {!hayBusqueda && (
          <button onClick={onCreate} type="button">
            <FontAwesomeIcon icon={faPlus} /> Registrar la primera
          </button>
        )}
      </EmptyState>
    );
  }

  return (
    <>
      <div className={styles.sedesGrid}>
        {sedesFiltradas.map((sede) => (
          <SedeCard key={sede.id} sede={sede} onEdit={onEdit} />
        ))}
      </div>

      {totalPaginas > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationButton}
            onClick={() => onPaginaChange(Math.max(pagina - 1, 1))}
            disabled={pagina === 1}
          >
            <FontAwesomeIcon icon={faChevronLeft} /> Anterior
          </button>

          <div className={styles.paginationInfo}>
            Página <strong>{pagina}</strong> de <strong>{totalPaginas}</strong>
          </div>

          <button
            className={styles.paginationButton}
            onClick={() => onPaginaChange(Math.min(pagina + 1, totalPaginas))}
            disabled={pagina === totalPaginas}
          >
            Siguiente <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </>
  );
};

export default SedesGrid;
