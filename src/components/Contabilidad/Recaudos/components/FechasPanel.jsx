import React from "react";
import styles from "../Recaudos.module.css";

/**
 * Panel dinámico según tipoFiltro:
 *  - "fecha": dos inputs date (fechaInicio + fechaFin)
 *  - "lapso": un input month
 *
 * Cada input usa el patrón de floating label del estilo Apple.
 */
const FechasPanel = ({
  tipoFiltro,
  fechaInicio,
  onFechaInicioChange,
  fechaFin,
  onFechaFinChange,
  lapso,
  onLapsoChange,
}) => (
  <div className={styles.grupoSelector}>
    <label className={styles.etiquetaPrincipal}>Parámetros de Tiempo</label>
    <div className={styles.fechasContainer}>
      {tipoFiltro === "fecha" ? (
        <>
          <div className={`${styles.formGroup} ${styles.floating}`}>
            <input
              type="date"
              className={styles.formInput}
              value={fechaInicio}
              onChange={(e) => onFechaInicioChange(e.target.value)}
              placeholder=" "
            />
            <label className={styles.formLabel}>Fecha Inicio</label>
          </div>
          <div className={`${styles.formGroup} ${styles.floating}`}>
            <input
              type="date"
              className={styles.formInput}
              value={fechaFin}
              onChange={(e) => onFechaFinChange(e.target.value)}
              placeholder=" "
            />
            <label className={styles.formLabel}>Fecha Fin</label>
          </div>
        </>
      ) : (
        <div className={`${styles.formGroup} ${styles.floating}`}>
          <input
            type="month"
            className={styles.formInput}
            value={lapso}
            onChange={(e) => onLapsoChange(e.target.value)}
            placeholder=" "
          />
          <label className={styles.formLabel}>Mes / Año</label>
        </div>
      )}
    </div>
  </div>
);

export default FechasPanel;
