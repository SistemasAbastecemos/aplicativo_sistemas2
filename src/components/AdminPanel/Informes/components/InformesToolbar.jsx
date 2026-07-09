import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faSyncAlt,
  faPlus,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Informes.module.css";

/**
 * Panel de control unificado del módulo.
 * Gestiona el Spotlight Search animado y la persistencia del orden jerárquico.
 */
const InformesToolbar = React.memo(
  ({
    search,
    onSearchChange,
    onRefresh,
    cargando,
    ordenModificado,
    onGuardarOrden,
    onNuevo,
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
            placeholder="Buscar por título o descripción..."
            value={search}
            onChange={onSearchChange}
          />
        </div>

        <button
          className={styles.refreshButton}
          onClick={onRefresh}
          title="Sincronizar base de datos"
          type="button"
        >
          <FontAwesomeIcon icon={faSyncAlt} />
        </button>

        {ordenModificado && (
          <button
            className={styles.saveOrderButton}
            onClick={onGuardarOrden}
            title="Sincronizar el orden jerárquico"
            type="button"
          >
            <FontAwesomeIcon icon={faSave} /> Guardar Orden
          </button>
        )}
      </div>

      <button className={styles.createButton} onClick={onNuevo} type="button">
        <FontAwesomeIcon icon={faPlus} /> Nuevo Informe
      </button>
    </div>
  ),
);

export default InformesToolbar;
