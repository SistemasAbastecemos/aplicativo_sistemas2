import React from "react";
import styles from "../AdministrarItems.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faSyncAlt } from "@fortawesome/free-solid-svg-icons";

const ItemsToolbar = React.memo(
  ({ search, setSearch, onCrearClick, onRefresh, cargando }) => {
    return (
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ítems por nombre o descripción..."
            />
          </div>

          <button
            type="button"
            className={styles.refreshButton}
            onClick={onRefresh}
            title="Actualizar datos"
          >
            <FontAwesomeIcon icon={faSyncAlt} />
          </button>
        </div>

        <button
          type="button"
          onClick={onCrearClick}
          className={styles.createButton}
        >
          <FontAwesomeIcon icon={faPlus} /> Nuevo Ítem
        </button>
      </div>
    );
  },
);

ItemsToolbar.displayName = "ItemsToolbar";
export default ItemsToolbar;
