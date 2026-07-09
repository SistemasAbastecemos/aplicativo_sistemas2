import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import styles from "../Recaudos.module.css";
import TipoFiltroSelector from "./TipoFiltroSelector";
import FechasPanel from "./FechasPanel";
import TransaccionSelector from "./TransaccionSelector";

/**
 * Panel de control principal: contiene los 3 grupos de filtros y los
 * botones de acción (Consultar + Exportar Excel).
 *
 * El botón Exportar se deshabilita si no hay resultados cargados.
 */
const FiltrosPanel = ({ filtros, hayResultados, onConsultar, onExportar }) => (
  <div className={styles.panelControl}>
    <div className={styles.filtrosEstructura}>
      <TipoFiltroSelector
        tipoFiltro={filtros.tipoFiltro}
        onChange={filtros.setTipoFiltro}
      />

      <FechasPanel
        tipoFiltro={filtros.tipoFiltro}
        fechaInicio={filtros.fechaInicio}
        onFechaInicioChange={filtros.setFechaInicio}
        fechaFin={filtros.fechaFin}
        onFechaFinChange={filtros.setFechaFin}
        lapso={filtros.lapso}
        onLapsoChange={filtros.setLapso}
      />

      <TransaccionSelector
        tipoTransaccion={filtros.tipoTransaccion}
        onChange={filtros.setTipoTransaccion}
      />
    </div>

    <div className={styles.accionesContainer}>
      <button
        className={styles.btnConsultar}
        onClick={onConsultar}
        type="button"
      >
        <FontAwesomeIcon icon={faSearch} />
        <span>Consultar Registros</span>
      </button>
      <button
        className={styles.btnExportar}
        onClick={onExportar}
        disabled={!hayResultados}
        type="button"
      >
        <FontAwesomeIcon icon={faFileExcel} />
        <span>Exportar Excel</span>
      </button>
    </div>
  </div>
);

export default FiltrosPanel;
