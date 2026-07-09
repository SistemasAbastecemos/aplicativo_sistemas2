import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHashtag,
  faBuilding,
  faMapMarkerAlt,
  faCheckCircle,
  faMapPin,
  faCity,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Sedes.module.css";

/**
 * Cuerpo del modal: campos de la sede en dos columnas. Es puramente
 * presentacional; el estado vive en el hook useSedeForm. El campo "código"
 * queda bloqueado en modo edición.
 */
const SedeForm = ({ formData, modoEdicion, onChange }) => (
  <div className={styles.formColumns}>
    <div className={styles.formColumn}>
      <div className={`${styles.formGroup} ${styles.floating}`}>
        <label className={styles.formLabel}>
          <FontAwesomeIcon icon={faHashtag} /> Código *
        </label>
        <input
          type="text"
          name="codigo"
          value={formData.codigo}
          onChange={onChange}
          maxLength={3}
          disabled={modoEdicion}
          className={`${styles.formInput} ${!formData.codigo ? styles.inputError : ""}`}
          placeholder="Ej: B01"
        />
      </div>

      <div className={`${styles.formGroup} ${styles.floating}`}>
        <label className={styles.formLabel}>
          <FontAwesomeIcon icon={faBuilding} /> Nombre *
        </label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={onChange}
          className={`${styles.formInput} ${!formData.nombre ? styles.inputError : ""}`}
          placeholder="Nombre de la sede u oficina"
        />
      </div>

      <div className={`${styles.formGroup} ${styles.floating}`}>
        <label className={styles.formLabel}>
          <FontAwesomeIcon icon={faMapMarkerAlt} /> Dirección
        </label>
        <input
          type="text"
          name="direccion"
          value={formData.direccion}
          onChange={onChange}
          className={styles.formInput}
          placeholder="Dirección física completa"
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
          <option value={1}>Activa (Habilitada)</option>
          <option value={0}>Inactiva (Suspendida)</option>
        </select>
      </div>
    </div>

    <div className={styles.formColumn}>
      <div className={`${styles.formGroup} ${styles.floating}`}>
        <label className={styles.formLabel}>
          <FontAwesomeIcon icon={faMapPin} /> Barrio
        </label>
        <input
          type="text"
          name="barrio"
          value={formData.barrio}
          onChange={onChange}
          className={styles.formInput}
          placeholder="Barrio, comuna o sector"
        />
      </div>

      <div className={`${styles.formGroup} ${styles.floating}`}>
        <label className={styles.formLabel}>
          <FontAwesomeIcon icon={faCity} /> Ciudad
        </label>
        <input
          type="text"
          name="ciudad"
          value={formData.ciudad}
          onChange={onChange}
          className={styles.formInput}
          placeholder="Ciudad o municipio"
        />
      </div>

      <div className={`${styles.formGroup} ${styles.floating}`}>
        <label className={styles.formLabel}>
          <FontAwesomeIcon icon={faLocationDot} /> Departamento
        </label>
        <input
          type="text"
          name="departamento"
          value={formData.departamento}
          onChange={onChange}
          className={styles.formInput}
          placeholder="Departamento o provincia"
        />
      </div>
    </div>
  </div>
);

export default SedeForm;
