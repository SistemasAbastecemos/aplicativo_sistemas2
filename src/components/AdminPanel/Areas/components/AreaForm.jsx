import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faFileLines,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Areas.module.css";

/**
 * Cuerpo del modal: campos del área en dos columnas (nombre y descripción a
 * la izquierda, estado a la derecha). Puramente presentacional; el estado
 * vive en el hook useAreaForm.
 */
const AreaForm = ({ formData, onChange }) => (
  <div className={styles.formColumns}>
    <div className={styles.formColumn}>
      <div className={`${styles.formGroup} ${styles.floating}`}>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={onChange}
          className={`${styles.formInput} ${!formData.nombre ? styles.inputError : ""}`}
          placeholder="Ej: Recursos Humanos, Tecnología"
        />
        <label className={styles.formLabel}>
          <FontAwesomeIcon icon={faBuilding} /> Nombre del Área *
        </label>
      </div>

      <div className={`${styles.formGroup} ${styles.floating}`}>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={onChange}
          className={`${styles.formTextarea} ${!formData.descripcion ? styles.inputError : ""}`}
          placeholder="Descripción detallada del área..."
          rows="4"
        />
        <label className={styles.formLabel}>
          <FontAwesomeIcon icon={faFileLines} /> Descripción *
        </label>
      </div>
    </div>

    <div className={styles.formColumn}>
      <div className={`${styles.formGroup} ${styles.floating}`}>
        <select
          name="activo"
          value={formData.activo}
          onChange={onChange}
          className={styles.formSelect}
        >
          <option value={1}>Activa</option>
          <option value={0}>Inactiva</option>
        </select>
        <label className={styles.formLabel}>
          <FontAwesomeIcon icon={faCheckCircle} /> Estado
        </label>
      </div>
    </div>
  </div>
);

export default AreaForm;
