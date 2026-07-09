import React from "react";
import styles from "../Cargos.module.css";

const CargosStats = React.memo(({ cargos, totalCargos, totalPaginas }) => {
  const activos = cargos.filter((c) => c.activo).length;
  const inactivos = cargos.filter((c) => !c.activo).length;

  return (
    <div className={styles.stats}>
      <div className={styles.statCard}>
        <span className={styles.statNumber}>{totalCargos}</span>
        <span className={styles.statLabel}>Total cargos</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statNumber}>{activos}</span>
        <span className={styles.statLabel}>Activos</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statNumber}>{inactivos}</span>
        <span className={styles.statLabel}>Inactivos</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statNumber}>{totalPaginas}</span>
        <span className={styles.statLabel}>Páginas</span>
      </div>
    </div>
  );
});

export default CargosStats;
