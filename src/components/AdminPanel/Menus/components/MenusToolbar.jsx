import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSyncAlt, faPlus } from "@fortawesome/free-solid-svg-icons";
import styles from "../Menus.module.css";

/**
 * Barra de controles: búsqueda de menús, botón de refresco y botón de
 * creación (visible solo si el usuario tiene permiso).
 */
const MenusToolbar = ({
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
          placeholder="Buscar nodo o ruta analítica..."
          value={search}
          onChange={onSearchChange}
        />
      </div>
      <button
        className={styles.refreshButton}
        onClick={onRefresh}
        title="Sincronizar base de datos"
      >
        <FontAwesomeIcon icon={faSyncAlt} />
      </button>
    </div>

    {puedeCrear && (
      <button className={styles.createButton} onClick={onCreate}>
        <FontAwesomeIcon icon={faPlus} /> Nuevo Menú
      </button>
    )}
  </div>
);

export default MenusToolbar;
