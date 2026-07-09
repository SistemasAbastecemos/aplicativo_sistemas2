import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGripLines,
  faChevronLeft,
  faChevronRight,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Menus.module.css";
import MenuCard from "./MenuCard";
import EmptyState from "../../../UI/EmptyState";

/**
 * Cuadrícula de menús. Muestra el estado vacío global cuando no hay resultados,
 * el hint de arrastre cuando procede, las tarjetas y la paginación.
 */
const MenusGrid = ({
  menusFiltrados,
  menus,
  search,
  puedeEditar,
  puedeCrear, // Agregamos la prop de control de permisos para renderizado seguro
  currentPath,
  pagina,
  totalPaginas,
  onPaginaChange,
  drag,
  onEdit,
  onNuevoMenu, // Agregamos el callback para disparar la apertura del formulario de creación
}) => {
  // Manejo del estado vacío adaptado al componente global, agnóstico y composable
  if (menusFiltrados.length === 0) {
    const hayBusqueda = !!search;

    return (
      <EmptyState
        icon="📋"
        title={hayBusqueda ? "Sin coincidencias" : "Repositorio vacío"}
        description={
          hayBusqueda
            ? `No se encontraron menús que coincidan con "${search.trim()}". Intenta con otro término.`
            : "Utilice la herramienta de creación para añadir el primer nodo jerárquico."
        }
      >
        {/* Inyección dinámica del botón mediante composición (children)
          Solo se muestra si NO es una búsqueda (repositorio virgen) y si el usuario tiene permisos
        */}
        {!hayBusqueda && puedeCrear && onNuevoMenu && (
          <button onClick={onNuevoMenu} type="button">
            <FontAwesomeIcon icon={faPlus} /> Configurar Primer Menú
          </button>
        )}
      </EmptyState>
    );
  }

  const mostrarHint =
    search.length === 0 &&
    puedeEditar &&
    menusFiltrados.length > 1 &&
    !drag.draggingId;

  return (
    <>
      {mostrarHint && (
        <p className={styles.dragHint}>
          <FontAwesomeIcon icon={faGripLines} /> Arrastre las tarjetas para
          reordenar la precedencia visual en la barra lateral
        </p>
      )}

      <div
        className={`${styles.menusGrid} ${drag.draggingId ? styles.gridDragging : ""}`}
        onDragLeave={drag.handleDragLeaveGrid}
      >
        {menusFiltrados.map((menu, index) => (
          <MenuCard
            key={menu.id}
            menu={menu}
            index={index}
            onEdit={onEdit}
            menus={menus}
            currentPath={currentPath}
            isDraggable={search.length === 0 && puedeEditar}
            isDragging={drag.draggingId === menu.id}
            isDragOver={
              drag.dragOverId === menu.id && drag.draggingId !== menu.id
            }
            isDragActive={!!drag.draggingId}
            onDragStart={drag.handleDragStart}
            onDragEnter={drag.handleDragEnter}
            onDragOver={drag.handleDragOver}
            onDragEnd={drag.handleDragEnd}
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

export default MenusGrid;
