import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Reportes.module.css";
import { ESTADOS_OPTIONS, SEDES_OPTIONS } from "../utils/constants";

/**
 * Controles superiores: filtros de estado y sede, búsqueda con trim, y
 * botón de refresco. La lupa se transforma en spinner cuando `cargando` es
 * true para dar feedback visual del fetch.
 */
const ReportesToolbar = ({
  estado,
  onEstadoChange,
  sede,
  onSedeChange,
  searchInput,
  onSearchChange,
  onRefresh,
  cargando,
}) => (
  <div className={styles.controls}>
    <div className={styles.filters}>
      <div className={`${styles.formGroup} ${styles.floating}`}>
        <select
          className={styles.formSelect}
          value={estado}
          onChange={onEstadoChange}
        >
          {ESTADOS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label className={styles.formLabel}>
          <FontAwesomeIcon icon={faFilter} /> Estado
        </label>
      </div>

      <div className={`${styles.formGroup} ${styles.floating}`}>
        <select
          className={styles.formSelect}
          value={sede}
          onChange={onSedeChange}
        >
          {SEDES_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label className={styles.formLabel}>Sede</label>
      </div>

      <div className={`${styles.formGroup} ${styles.floating} ${styles.searchGroupWrapper}`}>
        <div className={styles.searchGroup}>
          <FontAwesomeIcon
            icon={cargando ? faSyncAlt : faSearch}
            className={`${styles.searchIcon} ${cargando ? styles.spin : ""}`}
          />
          <input
            type="text"
            className={styles.formInput}
            value={searchInput}
            onChange={onSearchChange}
            placeholder=" "
          />
          <label className={styles.formLabel}>Buscar registros</label>
        </div>
      </div>

      <button
        className={styles.refreshButton}
        onClick={onRefresh}
        title="Actualizar datos"
        type="button"
        disabled={cargando}
      >
        <FontAwesomeIcon icon={faSyncAlt} />
      </button>
    </div>
  </div>
);

export default ReportesToolbar;
