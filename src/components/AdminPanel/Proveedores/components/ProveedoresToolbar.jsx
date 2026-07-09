import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSyncAlt, faPlus } from "@fortawesome/free-solid-svg-icons";
import styles from "../Proveedores.module.css";

const ProveedoresToolbar = React.memo(
  ({ search, onSearchChange, onRefresh, cargando, puedeCrear, onCreate }) => (
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
            placeholder="Buscar proveedor por NIT o correo..."
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
          <FontAwesomeIcon icon={faPlus} /> Nuevo Proveedor
        </button>
      )}
    </div>
  ),
);

export default ProveedoresToolbar;
