import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSyncAlt, faPlus } from "@fortawesome/free-solid-svg-icons";
import styles from "../Sedes.module.css";

/**
 * Controles del módulo: búsqueda de sedes, botón de refresco y botón de
 * creación (visible solo con permiso de crear).
 */
const SedesToolbar = ({
  search,
  onSearchChange,
  onRefresh,
  cargando,
  puedeCrear,
  onCreate,
}) => (
  <div className={styles.controls}>
    <div className={styles.filters}>
      <div className={styles.searchGroup}>
        <FontAwesomeIcon
          icon={cargando ? faSyncAlt : faSearch}
          className={`${styles.searchIcon} ${cargando ? styles.spin : ""}`}
        />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar sedes por código, nombre o ubicación..."
          value={search}
          onChange={onSearchChange}
        />
      </div>

      <button
        className={styles.refreshButton}
        onClick={onRefresh}
        title="Actualizar datos"
      >
        <FontAwesomeIcon icon={faSyncAlt} />
      </button>
    </div>

    {puedeCrear && (
      <button className={styles.createButton} onClick={onCreate}>
        <FontAwesomeIcon icon={faPlus} /> Nueva Sede
      </button>
    )}
  </div>
);

export default SedesToolbar;
