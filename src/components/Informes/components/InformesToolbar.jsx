import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Informes.module.css";

const InformesToolbar = ({
  searchTerm,
  onSearchChange,
  selectedArea,
  onAreaChange,
  areasUnicas,
  cargando,
  onRefresh,
}) => (
  <div className={styles.controlBar}>
    <div className={styles.searchGroup}>
      <FontAwesomeIcon
        icon={cargando ? faSyncAlt : faSearch}
        className={`${styles.searchIcon} ${cargando ? styles.spin : ""}`}
      />
      <input
        type="text"
        placeholder="Buscar reporte analítico..."
        value={searchTerm}
        onChange={onSearchChange}
        className={styles.searchInput}
      />
    </div>

    <div className={styles.filterGroup}>
      <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
      <select
        value={selectedArea}
        onChange={(e) => onAreaChange(e.target.value)}
        className={styles.areaSelect}
      >
        <option value="all">Todos los departamentos</option>
        {areasUnicas.map((area) => (
          <option key={area} value={area}>
            {area}
          </option>
        ))}
      </select>
    </div>

    <button
      className={styles.refreshButton}
      onClick={onRefresh}
      title="Sincronizar repositorio analítico"
      type="button"
      disabled={cargando}
    >
      <FontAwesomeIcon icon={faSyncAlt} />
    </button>
  </div>
);

export default InformesToolbar;
