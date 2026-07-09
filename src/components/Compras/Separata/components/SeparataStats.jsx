import React from "react";
import styles from "../ProgramacionSeparata.module.css";

const SeparataStats = ({ totalSeparatas, totalItems, totalPaginas }) => (
  <div className={styles.stats}>
    <div className={styles.statCard}>
      <span className={styles.statNumber}>{totalSeparatas}</span>
      <span className={styles.statLabel}>Separatas totales</span>
    </div>
    <div className={styles.statCard}>
      <span className={styles.statNumber}>{totalItems}</span>
      <span className={styles.statLabel}>Items actuales</span>
    </div>
    <div className={styles.statCard}>
      <span className={styles.statNumber}>{totalPaginas}</span>
      <span className={styles.statLabel}>Páginas</span>
    </div>
  </div>
);

export default SeparataStats;
