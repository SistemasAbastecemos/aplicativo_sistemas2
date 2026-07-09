import React from "react";
import styles from "../LibroAuxiliar.module.css";
import { formatearCOP } from "../utils/helpers";

/**
 * Header sticky con título y card lateral mostrando el total general
 * (suma de valor_debito) — solo aparece cuando hay datos.
 */
const LibroHeader = ({ totalGeneral, hayDatos }) => (
  <header className={styles.header}>
    <div className={styles.headerContent}>
      <h1 className={styles.title}>Libro Auxiliar</h1>
      <p className={styles.subtitle}>
        Consulta y exportación de movimientos contables por cuenta
      </p>

      {hayDatos && (
        <div className={styles.totalGeneralCard}>
          <span className={styles.totalLabel}>Total General</span>
          <span className={styles.totalValue}>
            {formatearCOP(totalGeneral)}
          </span>
        </div>
      )}
    </div>
  </header>
);

export default LibroHeader;
