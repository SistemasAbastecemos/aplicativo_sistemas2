import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import styles from "../PlanosContables.module.css";

/**
 * Toggle admin-only para habilitar/deshabilitar globalmente la carga de
 * planos. Ocupa fila completa dentro del grid de configuración porque no
 * es una "restricción" sino un switch global.
 */
const ToggleCargaBlock = ({ habilitada, onToggle }) => (
  <div className={styles.configBlockFull}>
    <div className={styles.blockHeader}>
      <FontAwesomeIcon icon={faUpload} />
      <h4>Disponibilidad del Módulo de Carga (Uso Interno)</h4>
    </div>
    <div className={styles.blockBody}>
      <label className={styles.toggleLabel}>
        <input
          type="checkbox"
          className={styles.toggleInput}
          checked={habilitada}
          onChange={onToggle}
        />
        <span className={styles.toggleSlider}></span>
        <span className={styles.toggleText}>
          {habilitada
            ? "Módulo de Carga Habilitado"
            : "Módulo de Carga Suspendido"}
        </span>
      </label>
    </div>
  </div>
);

export default ToggleCargaBlock;
