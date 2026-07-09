import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faSyncAlt,
  faBox,
  faTimes,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../ProgramacionSeparata.module.css";

/**
 * Controles superiores: toggle del sidebar, rango de fechas, refresh y
 * apertura del modal de historial. La toolbar es intencionalmente delgada:
 * solo forwardea eventos.
 */
const SeparataToolbar = ({
  fechaInicio,
  fechaFinal,
  onFechaChange,
  onRefresh,
  onOpenHistory,
  sidebarVisible,
  onToggleSidebar,
  toggleRef,
  cargando,
}) => (
  <div className={styles.controls}>
    <div className={styles.filters}>
      <button
        ref={toggleRef}
        className={styles.sidebarToggle}
        onClick={onToggleSidebar}
        title="Mostrar/ocultar formulario"
        type="button"
      >
        <FontAwesomeIcon icon={sidebarVisible ? faTimes : faBox} />
        {sidebarVisible ? "Ocultar" : "Agregar Item"}
      </button>

      <div className={styles.dateRangeContainer}>
        <div className={`${styles.formGroup} ${styles.floating} ${styles.dateGroup}`}>
          <div className={styles.searchGroup}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.searchIcon} />
            <input
              type="date"
              className={styles.formInput}
              value={fechaInicio}
              onChange={(e) => onFechaChange("inicio", e.target.value)}
              placeholder=" "
            />
          </div>
          <label className={styles.formLabel}>Fecha Inicio</label>
        </div>

        <div className={styles.dateSeparator}>
          <span>a</span>
        </div>

        <div className={`${styles.formGroup} ${styles.floating} ${styles.dateGroup}`}>
          <div className={styles.searchGroup}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.searchIcon} />
            <input
              type="date"
              className={styles.formInput}
              value={fechaFinal}
              onChange={(e) => onFechaChange("final", e.target.value)}
              placeholder=" "
            />
          </div>
          <label className={styles.formLabel}>Fecha Final</label>
        </div>
      </div>

      <button
        className={styles.refreshButton}
        onClick={onRefresh}
        title="Actualizar datos"
        type="button"
        disabled={cargando}
      >
        <FontAwesomeIcon icon={faSyncAlt} className={cargando ? styles.spin : ""} />
      </button>

      <button
        className={styles.historyButton}
        onClick={onOpenHistory}
        title="Consultar historial en separatas"
        type="button"
      >
        <FontAwesomeIcon icon={faHistory} />
        Historial Item
      </button>
    </div>
  </div>
);

export default SeparataToolbar;
