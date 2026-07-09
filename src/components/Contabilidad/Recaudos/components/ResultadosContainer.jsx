import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faList } from "@fortawesome/free-solid-svg-icons";
import styles from "../Recaudos.module.css";
import EmptyState from "../../../UI/EmptyState";
import RecaudosTable from "./RecaudosTable";
import Paginacion from "./Paginacion";
import { formatearEntero } from "../utils/helpers";

/**
 * Contenedor principal de resultados. Muestra:
 *  - EmptyState global cuando aún no se ha consultado (o vino vacío)
 *  - Header con badge de conteo + buscador
 *  - Tabla + paginación cuando hay datos
 *
 * El buscador filtra en cliente sobre todos los campos con trim aplicado.
 */
const ResultadosContainer = ({
  hayResultados,
  resultadosProcesados,
  datosPaginados,
  terminoBusqueda,
  onBusquedaChange,
  orden,
  onSolicitarOrden,
  paginaActual,
  totalPaginas,
  onCambioPagina,
}) => {
  if (!hayResultados) {
    return (
      <div className={styles.resultadosContainer}>
        <EmptyState
          icon={faList}
          title="Sin datos para mostrar"
          description="Ajuste los parámetros de búsqueda y presione Consultar."
        />
      </div>
    );
  }

  return (
    <div className={styles.resultadosContainer}>
      <div className={styles.tablaAcciones}>
        <div className={styles.tablaHeaderInfo}>
          <h3>Resultados de la Consulta</h3>
          <span className={styles.badgeTotal}>
            {formatearEntero(resultadosProcesados.length)} registros filtrados
          </span>
        </div>

        <div className={styles.buscadorContainer}>
          <FontAwesomeIcon icon={faSearch} className={styles.iconoBuscador} />
          <input
            type="text"
            className={styles.inputBuscador}
            placeholder="Buscar en todos los campos..."
            value={terminoBusqueda}
            onChange={onBusquedaChange}
          />
        </div>
      </div>

      <RecaudosTable
        datos={datosPaginados}
        orden={orden}
        onSolicitarOrden={onSolicitarOrden}
      />

      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalRegistros={resultadosProcesados.length}
        onCambioPagina={onCambioPagina}
      />
    </div>
  );
};

export default ResultadosContainer;
