import React from "react";
import styles from "../Recaudos.module.css";

const RecaudosHeader = () => (
  <header className={styles.header}>
    <div className={styles.headerContent}>
      <h1 className={styles.title}>Reporte de Recaudos</h1>
      <p className={styles.subtitle}>
        Consulta y exportación de transacciones por medio de pago
      </p>
    </div>
  </header>
);

export default RecaudosHeader;
