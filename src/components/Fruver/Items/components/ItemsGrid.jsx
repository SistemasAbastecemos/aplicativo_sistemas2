import React from "react";
import styles from "../AdministrarItems.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import EmptyState from "../../../UI/EmptyState";
import ItemTable from "./ItemTable";
import ItemCard from "./ItemCard";

export const ItemsGrid = React.memo(
  ({ items, pagina, totalPaginas, onPageChange, onEditClick }) => {
    if (items.length === 0) {
      return (
        <div className={styles.vacioGridCanvas}>
          <EmptyState
            icon={faBoxOpen}
            title="Catálogo de Ítems Vacío"
            description="No se encontraron registros que coincidan con los criterios de búsqueda o filtros ingresados actualmente."
          />
        </div>
      );
    }

    return (
      <div className={styles.gridModuloWrapper}>
        {/* Visualización híbrida adaptable por CSS */}
        <div className={styles.desktopViewContainer}>
          <ItemTable items={items} onEditClick={onEditClick} />
        </div>

        <div className={styles.mobileViewContainer}>
          <div className={styles.appleResponsiveGrid}>
            {items.map((item) => (
              <ItemCard key={item.item} item={item} onEditClick={onEditClick} />
            ))}
          </div>
        </div>

        {/* Control de Navegación de Paginación */}
        {totalPaginas > 1 && (
          <div className={styles.paginationCanvasFooter}>
            <button
              type="button"
              disabled={pagina === 1}
              onClick={() => onPageChange(pagina - 1)}
              className={styles.btnPageActionControl}
            >
              <FontAwesomeIcon icon={faChevronLeft} /> Anterior
            </button>
            <span className={styles.pageIndicatorText}>
              Página <strong>{pagina}</strong> de {totalPaginas}
            </span>
            <button
              type="button"
              disabled={pagina === totalPaginas}
              onClick={() => onPageChange(pagina + 1)}
              className={styles.btnPageActionControl}
            >
              Siguiente <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        )}
      </div>
    );
  },
);

ItemsGrid.displayName = "ItemsGrid";
