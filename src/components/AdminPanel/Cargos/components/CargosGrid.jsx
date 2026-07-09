import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Cargos.module.css";
import CargoCard from "./CargoCard";
import EmptyState from "../../../UI/EmptyState";

const CargosGrid = ({
  cargosFiltrados,
  areas,
  search,
  puedeCrear,
  pagina,
  totalPaginas,
  onPaginaChange,
  onEdit,
  onCreate,
}) => {
  if (cargosFiltrados.length === 0) {
    const hayBusqueda = !!search;
    return (
      <EmptyState
        icon="💼"
        title={hayBusqueda ? "Sin coincidencias" : "No hay cargos registrados"}
        description={
          hayBusqueda
            ? `No se encontraron cargos que coincidan con "${search.trim()}". Intenta con otro término.`
            : "Utilice la herramienta corporativa para añadir el primer cargo jerárquico."
        }
      >
        {!hayBusqueda && puedeCrear && onCreate && (
          <button onClick={onCreate} type="button">
            <FontAwesomeIcon icon={faUserPlus} /> Configurar Primer Cargo
          </button>
        )}
      </EmptyState>
    );
  }

  return (
    <>
      <div className={styles.cargosGrid}>
        {cargosFiltrados.map((cargo) => (
          <CargoCard
            key={cargo.id}
            cargo={cargo}
            areas={areas}
            onEdit={onEdit}
          />
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

export default CargosGrid;
