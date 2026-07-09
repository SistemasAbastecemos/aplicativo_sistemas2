import React from "react";
import styles from "../Informes.module.css";

const InformesHeader = ({ totalDisponibles }) => (
  <header className={styles.header}>
    <div className={styles.headerContent}>
      <h1 className={styles.title}>Inteligencia de Negocios</h1>
      <p className={styles.subtitle}>
        Analítica y métricas organizacionales centralizadas
      </p>
      <div className={styles.kpiGroup}>
        <div className={styles.kpiBadge}>
          <span className={styles.kpiLabel}>Módulos Asignados</span>
          <span className={styles.kpiValue}>{totalDisponibles}</span>
        </div>
      </div>
    </div>
  </header>
);

export default InformesHeader;
