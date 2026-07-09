import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import styles from "../ActualizarInventario.module.css";

const InventarioSelector = React.memo(({ tipoInventario, onTipoChange }) => (
  <div className={styles.controls}>
    <div className={styles.filters}>
      <div className={`${styles.filterGroup} ${styles.floating}`}>
        <select
          value={tipoInventario}
          onChange={onTipoChange}
          className={styles.filterSelect}
        >
          <option value="cajas">Cajas</option>
          <option value="balanzas">Balanzas POS</option>
          <option value="cajones">Cajones POS</option>
          <option value="escaneres">Escáneres POS</option>
          <option value="impresoras">Impresoras POS</option>
          <option value="pcs">PCs POS</option>
        </select>
        <label>
          <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
          Tipo de Inventario
        </label>
      </div>
    </div>
  </div>
));

export default InventarioSelector;
