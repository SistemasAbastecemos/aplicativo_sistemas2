import React from "react";
import styles from "../Reportes.module.css";

const ReportesHeader = () => (
  <header className={styles.header}>
    <div className={styles.headerContent}>
      <h1 className={styles.title}>Reportes CVM</h1>
      <p className={styles.subtitle}>
        Gestión y seguimiento de verificaciones metrológicas
      </p>
    </div>
  </header>
);

export default ReportesHeader;
