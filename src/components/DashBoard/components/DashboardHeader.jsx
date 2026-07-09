import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import styles from "../Dashboard.module.css";

const DashboardHeader = ({ empresaNombre, searchTerm, setSearchTerm }) => (
  <header className={styles.header}>
    <div className={styles.headerContent}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.subtitle}>
        Panel principal del sistema {empresaNombre}
      </p>
      <div className={styles.searchSection}>
        <div className={styles.searchInputContainer}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar funciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button
              className={styles.clearSearch}
              onClick={() => setSearchTerm("")}
              aria-label="Limpiar búsqueda"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </div>
    </div>
  </header>
);

export default DashboardHeader;
