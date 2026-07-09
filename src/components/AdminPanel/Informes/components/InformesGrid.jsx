import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faChartLine,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Informes.module.css";
import EmptyState from "../../../UI/EmptyState";
import InformesTable from "./InformesTable";

const InformesGrid = ({
  informes,
  searchTerm,
  draggingIndex,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onEditar,
  onCreate,
}) => {
  if (informes.length === 0) {
    const hayBusqueda = !!searchTerm;

    return (
      <EmptyState
        icon={hayBusqueda ? faSearch : faChartLine}
        title={
          hayBusqueda ? "Sin coincidencias" : "Aún no hay informes registrados"
        }
        description={
          hayBusqueda
            ? `No se encontraron informes que coincidan con "${searchTerm}". Intenta con otro término.`
            : "Comienza registrando el primer módulo analítico."
        }
      >
        {!hayBusqueda && onCreate && (
          <button className={styles.createButton} onClick={onCreate}>
            <FontAwesomeIcon icon={faPlus} /> Crear primer informe
          </button>
        )}
      </EmptyState>
    );
  }

  return (
    <InformesTable
      informes={informes}
      searchTerm={searchTerm}
      draggingIndex={draggingIndex}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onEditar={onEditar}
    />
  );
};

export default InformesGrid;
