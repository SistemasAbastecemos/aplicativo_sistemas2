import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faSearch,
  faBuilding,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Areas.module.css";
import AreaCard from "./AreaCard";
import EmptyState from "../../../UI/EmptyState";

const AreasGrid = ({
  areasFiltradas,
  search,
  onEdit,
  onCreate,
  pagina,
  totalPaginas,
  onPaginaChange,
}) => {
  if (areasFiltradas.length === 0) {
    const hayBusqueda = !!search?.trim();

    return (
      <EmptyState
        icon={hayBusqueda ? faSearch : faBuilding}
        title={
          hayBusqueda ? "Sin coincidencias" : "Aún no hay áreas registradas"
        }
        description={
          hayBusqueda
            ? `No se encontraron áreas que coincidan con "${search.trim()}". Intenta con otro término.`
            : "Comienza estructurando tu organización creando la primera área."
        }
      >
        {!hayBusqueda && onCreate && (
          <button className={styles.createButton} onClick={onCreate}>
            <FontAwesomeIcon icon={faPlus} /> Crear primera área
          </button>
        )}
      </EmptyState>
    );
  }

  return (
    <>
      <div className={styles.areasGrid}>
        {areasFiltradas.map((area) => (
          <AreaCard key={area.id} area={area} onEdit={onEdit} />
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

export default AreasGrid;
