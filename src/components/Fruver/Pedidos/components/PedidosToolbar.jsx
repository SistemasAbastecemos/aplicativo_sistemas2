import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faSearch,
  faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Pedidos.module.css";

/**
 * Toolbar con:
 *  - Selector de fecha (dispara refetch al cambiar)
 *  - Buscador con trim aplicado (filtra en cliente)
 *  - Botón refresh (recarga la fecha actual)
 *
 * La lupa se transforma en spinner cuando `cargando` es true para dar
 * feedback visual del fetch.
 */
const PedidosToolbar = ({
  fecha,
  onFechaChange,
  search,
  onSearchChange,
  onRefresh,
  cargando,
}) => (
  <div className={styles.controls}>
    <div className={styles.filters}>
      {/* Fecha */}
      <div className={`${styles.formGroup} ${styles.floating}`}>
        <div className={styles.searchGroup}>
          <FontAwesomeIcon icon={faCalendarAlt} className={styles.searchIcon} />
          <input
            type="date"
            value={fecha}
            onChange={(e) => onFechaChange(e.target.value)}
            className={styles.formInput}
          />
          <label className={styles.formLabel}>Fecha</label>
        </div>
      </div>

      {/* Búsqueda */}
      <div
        className={`${styles.formGroup} ${styles.floating} ${styles.searchWrapper}`}
      >
        <div className={styles.searchGroup}>
          <FontAwesomeIcon
            icon={cargando ? faSyncAlt : faSearch}
            className={`${styles.searchIcon} ${cargando ? styles.spin : ""}`}
          />
          <input
            type="text"
            value={search}
            onChange={onSearchChange}
            className={styles.searchInput}
            placeholder=" "
          />
          <label className={styles.formLabel}>Buscar items</label>
        </div>
      </div>

      {/* Refresh */}
      <button
        className={styles.refreshButton}
        onClick={onRefresh}
        title="Actualizar datos"
        disabled={cargando}
        type="button"
      >
        <FontAwesomeIcon icon={faSyncAlt} />
      </button>
    </div>
  </div>
);

export default PedidosToolbar;
