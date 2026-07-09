import React from "react";
import { faClipboardList, faSearch } from "@fortawesome/free-solid-svg-icons";
import styles from "../Pedidos.module.css";
import EmptyState from "../../../UI/EmptyState";
import PedidosTable from "./PedidosTable";
import Pagination from "./Pagination";

/**
 * Contenedor principal de resultados. Decide qué mostrar según haya
 * items o no, con el `EmptyState` global cuando el listado está vacío.
 *
 * El ícono y textos cambian según si el vacío viene de una búsqueda
 * activa o de que no hay datos para la fecha.
 */
const ResultadosContainer = ({
  currentItems,
  startIndex,
  pedidos,
  expandedId,
  hayBusqueda,
  searchTrimmed,
  paginaActual,
  totalPages,
  onPageChange,
  onTogglePedido,
  onToggleDays,
}) => {
  if (currentItems.length === 0) {
    return (
      <EmptyState
        icon={hayBusqueda ? faSearch : faClipboardList}
        title={
          hayBusqueda
            ? "Sin coincidencias"
            : "No hay items para esta fecha"
        }
        description={
          hayBusqueda
            ? `No se encontraron items que coincidan con "${searchTrimmed}".`
            : "Prueba cambiar la fecha o presionar el botón de actualizar."
        }
      />
    );
  }

  return (
    <div className={styles.content}>
      <PedidosTable
        items={currentItems}
        startIndex={startIndex}
        pedidos={pedidos}
        expandedId={expandedId}
        onTogglePedido={onTogglePedido}
        onToggleDays={onToggleDays}
      />

      <Pagination
        paginaActual={paginaActual}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default ResultadosContainer;
