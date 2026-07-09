import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardCheck,
  faUser,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../CVM.module.css";

/**
 * Formulario superior: selector de supervisor (llena nombre + cédula desde
 * la lista de supervisores) y observaciones libres.
 */
const SupervisorFormSection = ({
  supervisores,
  nombre,
  onNombreChange,
  observaciones,
  onObservacionesChange,
}) => (
  <section className={styles.formSection}>
    <div className={styles.formCard}>
      <div className={styles.cardHeaderPanel}>
        <FontAwesomeIcon icon={faClipboardCheck} className={styles.cardIcon} />
        <h3>Información del Supervisor</h3>
      </div>
      <div className={styles.cardContent}>
        <div className={`${styles.formGroup} ${styles.floating}`}>
          <select
            className={styles.formSelect}
            value={nombre}
            onChange={onNombreChange}
            required
          >
            <option value="" disabled></option>
            {supervisores.map((supervisor) => (
              <option key={supervisor.id} value={supervisor.nombre}>
                {supervisor.nombre}
              </option>
            ))}
          </select>
          <label className={styles.formLabel}>
            <FontAwesomeIcon icon={faUser} />
            Nombre del Supervisor
          </label>
        </div>

        <div className={`${styles.formGroup} ${styles.floating}`}>
          <textarea
            className={styles.formTextarea}
            value={observaciones}
            onChange={onObservacionesChange}
            rows="3"
            placeholder=" "
          />
          <label className={styles.formLabel}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            Observaciones
          </label>
        </div>
      </div>
    </div>
  </section>
);

export default SupervisorFormSection;
