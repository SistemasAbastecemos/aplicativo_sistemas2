import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Proveedores.module.css";
import ProveedorCard from "./ProveedorCard";
import EmptyState from "../../../UI/EmptyState";

const ProveedoresGrid = ({
  proveedoresFiltrados,
  search,
  puedeCrear,
  pagina,
  totalPaginas,
  onPaginaChange,
  onEdit,
  onCreate,
}) => {
  if (proveedoresFiltrados.length === 0) {
    const hayBusqueda = !!search;
    return (
      <EmptyState
        icon="🏢"
        title={
          hayBusqueda ? "Sin coincidencias" : "No hay proveedores registrados"
        }
        description={
          hayBusqueda
            ? `No se encontraron proveedores que coincidan con "${search.trim()}". Intenta con otro término.`
            : "Comience asociando su primer aliado comercial externo en la plataforma."
        }
      >
        {!hayBusqueda && puedeCrear && onCreate && (
          <button onClick={onCreate} type="button">
            <FontAwesomeIcon icon={faUserPlus} /> Configurar Primer Proveedor
          </button>
        )}
      </EmptyState>
    );
  }

  return (
    <>
      <div className={styles.proveedoresGrid}>
        {proveedoresFiltrados.map((proveedor) => (
          <ProveedorCard
            key={proveedor.id}
            proveedor={proveedor}
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

export default ProveedoresGrid;
