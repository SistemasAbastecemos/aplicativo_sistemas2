import React from "react";
import styles from "../Recaudos.module.css";
import { TIPOS_TRANSACCION } from "../utils/constants";

/**
 * Select con los tres tipos de transacción disponibles (Todos, Efectivo,
 * Tarjetas). El default es "Todos".
 */
const TransaccionSelector = ({ tipoTransaccion, onChange }) => (
  <div className={styles.grupoSelector}>
    <label className={styles.etiquetaPrincipal}>Tipo de Transacción</label>
    <div className={`${styles.formGroup} ${styles.floating}`}>
      <select
        className={styles.formSelect}
        value={tipoTransaccion}
        onChange={(e) => onChange(e.target.value)}
      >
        {TIPOS_TRANSACCION.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <label className={styles.formLabel}>Transacción</label>
    </div>
  </div>
);

export default TransaccionSelector;
