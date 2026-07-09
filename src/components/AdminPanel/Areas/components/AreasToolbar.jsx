import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSyncAlt, faPlus } from "@fortawesome/free-solid-svg-icons";
import styles from "../Areas.module.css";

/**
 * Controles del módulo: búsqueda de áreas, botón de refresco y botón de
 * creación (visible solo con permiso de crear).
 */
const AreasToolbar = ({
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
          placeholder="Buscar áreas por nombre o descripción..."
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
        <FontAwesomeIcon icon={faPlus} /> Nueva Área
      </button>
    )}
  </div>
);

export default AreasToolbar;
