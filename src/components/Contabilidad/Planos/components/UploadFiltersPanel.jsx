import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faFilter } from "@fortawesome/free-solid-svg-icons";
import styles from "../PlanosContables.module.css";
import { EMPRESAS, TIPOS_ARCHIVO } from "../utils/constants";

/**
 * Selectores de empresa y tipo de archivo. Cada select tiene su floating
 * label. La empresa arranca en "AB" y el tipo debe seleccionarse
 * explícitamente antes de habilitar la subida.
 */
const UploadFiltersPanel = ({
  empresa,
  onEmpresaChange,
  tipo,
  onTipoChange,
}) => (
  <div className={styles.filtersPanel}>
    <div className={`${styles.formGroup} ${styles.floating}`}>
      <select
        className={styles.formSelect}
        value={empresa}
        onChange={onEmpresaChange}
      >
        {EMPRESAS.map((e) => (
          <option key={e.value} value={e.value}>
            {e.label}
          </option>
        ))}
      </select>
      <label className={styles.formLabel}>
        <FontAwesomeIcon icon={faBuilding} />
        Empresa
      </label>
    </div>

    <div className={`${styles.formGroup} ${styles.floating}`}>
      <select
        className={styles.formSelect}
        value={tipo}
        onChange={onTipoChange}
      >
        {TIPOS_ARCHIVO.map((t) => (
          <option key={t.value || "empty"} value={t.value} disabled={t.disabled}>
            {t.label}
          </option>
        ))}
      </select>
      <label className={styles.formLabel}>
        <FontAwesomeIcon icon={faFilter} />
        Tipo de Archivo
      </label>
    </div>
  </div>
);

export default UploadFiltersPanel;
