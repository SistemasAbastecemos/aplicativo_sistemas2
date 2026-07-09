import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTable,
  faFileCsv,
  faFileExcel,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../LibroAuxiliar.module.css";

/**
 * Barra de acciones: consultar (siempre habilitado), exportar CSV
 * (habilitado si hay datos), exportar Excel (habilitado si hay datos y
 * no superan el límite de 450k filas).
 *
 * Cuando Excel está bloqueado por volumen, muestra un tooltip visual
 * sugiriendo usar CSV.
 */
const AccionesBar = ({
  hayDatos,
  excelBloqueado,
  onConsultar,
  onExportarCSV,
  onExportarExcel,
}) => (
  <div className={styles.actionContainer}>
    <button
      className={styles.btnPrimary}
      onClick={onConsultar}
      type="button"
    >
      <FontAwesomeIcon icon={faTable} />
      <span>Consultar</span>
    </button>

    <button
      className={styles.btnCSV}
      onClick={onExportarCSV}
      disabled={!hayDatos}
      type="button"
    >
      <FontAwesomeIcon icon={faFileCsv} />
      <span>Exportar CSV</span>
    </button>

    <div className={styles.excelControl}>
      <button
        className={styles.btnExcel}
        onClick={onExportarExcel}
        disabled={!hayDatos || excelBloqueado}
        type="button"
      >
        <FontAwesomeIcon icon={faFileExcel} />
        <span>Exportar Excel</span>
      </button>
      {excelBloqueado && (
        <span className={styles.warningTooltip}>
          <FontAwesomeIcon icon={faExclamationTriangle} /> Use CSV para más de
          450k filas
        </span>
      )}
    </div>
  </div>
);

export default AccionesBar;
