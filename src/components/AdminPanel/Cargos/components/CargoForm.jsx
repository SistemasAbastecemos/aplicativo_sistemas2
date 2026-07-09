import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faFileLines,
  faCheckCircle,
  faLayerGroup,
  faChartSimple,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Cargos.module.css";

/**
 * Cuerpo del modal de cargo: campos en dos columnas. Es puramente
 * presentacional; el estado vive en el hook del formulario. Extraído de
 * CargoModal para separar el contenedor del modal de su contenido.
 */
const CargoForm = ({ formData, areas, onChange }) => (
  <div className={styles.formColumns}>
    <div className={styles.formColumn}>
      <div className={`${styles.formGroup} ${styles.floating}`}>
        <label className={styles.formLabel}>
          <FontAwesomeIcon icon={faBriefcase} /> Nombre del Cargo *
        </label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={onChange}
          className={`${styles.formInput} ${!formData.nombre ? styles.inputError : ""}`}
          placeholder="Ej: Auxiliar de Sistemas"
        />
      </div>

      <div className={`${styles.formGroup} ${styles.floating}`}>
        <label className={styles.formLabel}>
          <FontAwesomeIcon icon={faFileLines} /> Descripción *
        </label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={onChange}
          className={`${styles.formTextarea} ${!formData.descripcion ? styles.inputError : ""}`}
          placeholder="Defina las responsabilidades del rol organizativo..."
          rows="3"
        />
      </div>

      <div className={`${styles.formGroup} ${styles.floating}`}>
        <label className={styles.formLabel}>
          <FontAwesomeIcon icon={faCheckCircle} /> Estado Operacional
        </label>
        <select
          name="activo"
          value={formData.activo}
          onChange={onChange}
          className={styles.formSelect}
        >
          <option value={1}>Activo (Habilitado)</option>
          <option value={0}>Inactivo (Deshabilitado)</option>
        </select>
      </div>
    </div>

    <div className={styles.formColumn}>
      <div className={`${styles.formGroup} ${styles.floating}`}>
        <label className={styles.formLabel}>
          <FontAwesomeIcon icon={faLayerGroup} /> Área Asignada *
        </label>
        <select
          name="id_area"
          value={formData.id_area ?? ""}
          onChange={onChange}
          className={`${styles.formSelect} ${!formData.id_area ? styles.inputError : ""}`}
        >
          <option value="">Seleccione un área...</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className={`${styles.formGroup} ${styles.floating}`}>
        <label className={styles.formLabel}>
          <FontAwesomeIcon icon={faChartSimple} /> Nivel Jerárquico
        </label>
        <select
          name="nivel"
          value={formData.nivel ?? ""}
          onChange={onChange}
          className={styles.formSelect}
        >
          <option value="">Seleccione nivel corporativo...</option>
          <option value={1}>Nivel 1 - Operativo</option>
          <option value={2}>Nivel 2 - Táctico</option>
          <option value={3}>Nivel 3 - Estratégico</option>
        </select>
      </div>
    </div>
  </div>
);

export default CargoForm;
