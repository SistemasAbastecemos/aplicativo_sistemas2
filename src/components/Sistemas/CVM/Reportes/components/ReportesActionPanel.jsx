import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import styles from "../Reportes.module.css";

/**
 * Panel de resolución del reporte. Aparece siempre pero el botón "Enviar"
 * queda deshabilitado hasta que el usuario:
 *  - esté en el filtro "No cumple"
 *  - haya seleccionado un registro
 *  - haya escrito una acción tomada
 */
const ReportesActionPanel = ({
  estadoFinal,
  onEstadoFinalChange,
  accionTomada,
  onAccionChange,
  onEnviar,
  isEnviarDisabled,
}) => (
  <div className={styles.actionPanel}>
    <div className={`${styles.formGroup} ${styles.floating}`}>
      <select
        className={styles.formSelect}
        value={estadoFinal}
        onChange={onEstadoFinalChange}
      >
        <option value="Bueno">Bueno</option>
      </select>
      <label className={styles.formLabel}>Estado Solución</label>
    </div>

    <div
      className={`${styles.formGroup} ${styles.floating} ${styles.accionInputWrapper}`}
    >
      <input
        type="text"
        className={styles.formInput}
        value={accionTomada}
        onChange={onAccionChange}
        placeholder=" "
      />
      <label className={styles.formLabel}>Acción Tomada</label>
    </div>

    <button
      className={`${styles.submitButton} ${
        isEnviarDisabled ? styles.disabled : ""
      }`}
      onClick={onEnviar}
      disabled={isEnviarDisabled}
      type="button"
    >
      <FontAwesomeIcon icon={faPaperPlane} />
      Enviar
    </button>
  </div>
);

export default ReportesActionPanel;
