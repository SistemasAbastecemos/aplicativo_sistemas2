import React from "react";
import styles from "../Reportes.module.css";

const ReportesStats = ({ total, totalPaginas, conIncumplimientos }) => (
  <div className={styles.stats}>
    <div className={styles.statCard}>
      <span className={styles.statNumber}>{total}</span>
      <span className={styles.statLabel}>Registros totales</span>
    </div>
    <div className={styles.statCard}>
      <span className={styles.statNumber}>{totalPaginas}</span>
      <span className={styles.statLabel}>Páginas</span>
    </div>
    <div className={styles.statCard}>
      <span className={styles.statNumber}>{conIncumplimientos}</span>
      <span className={styles.statLabel}>Con incumplimientos</span>
    </div>
  </div>
);

export default ReportesStats;
