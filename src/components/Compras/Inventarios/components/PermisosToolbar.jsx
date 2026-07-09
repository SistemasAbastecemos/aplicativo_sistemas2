import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSyncAlt, faPlus } from "@fortawesome/free-solid-svg-icons";
import styles from "../PermisosInventario.module.css";

const PermisosToolbar = React.memo(
  ({ search, onSearchChange, onRefresh, cargando, puedeCrear, onNuevo }) => (
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
            placeholder="Buscar por NIT o Razón Social..."
            value={search}
            onChange={onSearchChange}
          />
        </div>

        <button
          className={styles.refreshButton}
          onClick={onRefresh}
          title="Sincronizar base de datos"
          type="button"
          disabled={cargando}
        >
          <FontAwesomeIcon
            icon={faSyncAlt}
            className={cargando ? styles.spin : ""}
          />
        </button>
      </div>

      {puedeCrear && (
        <button className={styles.createButton} onClick={onNuevo} type="button">
          <FontAwesomeIcon icon={faPlus} /> Configurar Proveedor
        </button>
      )}
    </div>
  ),
);

export default PermisosToolbar;
