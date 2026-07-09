import React from "react";
import { faSearch, faChartLine } from "@fortawesome/free-solid-svg-icons";
import styles from "../Informes.module.css";
import EmptyState from "../../UI/EmptyState";
import InformeCard from "./InformeCard";

const InformesGrid = ({
  informes,
  hayBusqueda,
  searchTrimmed,
  onCardClick,
}) => {
  if (informes.length === 0) {
    return (
      <EmptyState
        icon={hayBusqueda ? faSearch : faChartLine}
        title={
          hayBusqueda ? "Sin coincidencias de filtro" : "Repositorio vacío"
        }
        description={
          hayBusqueda
            ? `No se encontraron informes que coincidan con "${searchTrimmed}". Modifique los parámetros de búsqueda.`
            : "No hay reportes analíticos asignados o disponibles para su perfil."
        }
      />
    );
  }

  return (
    <div className={styles.grid}>
      {informes.map((informe) => (
        <InformeCard key={informe.id} informe={informe} onClick={onCardClick} />
      ))}
    </div>
  );
};

export default InformesGrid;
