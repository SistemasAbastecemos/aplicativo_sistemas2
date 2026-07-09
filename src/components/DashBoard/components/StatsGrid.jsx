import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faShieldAlt,
  faCalendarDay,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Dashboard.module.css";
import { formatDateString, formatTimeString } from "../utils/formatters";

const StatsGrid = ({ stats, currentTime }) => (
  <div className={styles.statsGrid}>
    <div className={styles.statCard}>
      <div className={styles.statIconWrapper}>
        <FontAwesomeIcon icon={faCog} />
      </div>
      <div className={styles.statContent}>
        <p className={styles.statLabel}>Funciones Disponibles</p>
        <h3>{stats.funcionesDisponibles}</h3>
      </div>
    </div>

    <div className={styles.statCard}>
      <div className={styles.statIconWrapper}>
        <FontAwesomeIcon icon={faShieldAlt} />
      </div>
      <div className={styles.statContent}>
        <p className={styles.statLabel}>Permisos Asignados</p>
        <h3>{stats.permisosTotales}</h3>
      </div>
    </div>

    <div className={styles.statCard}>
      <div className={styles.statIconWrapper}>
        <FontAwesomeIcon icon={faCalendarDay} />
      </div>
      <div className={styles.statContent}>
        <p className={`${styles.statLabel} ${styles.capitalizeText}`}>
          {formatDateString(currentTime)}
        </p>
        <h3>{formatTimeString(currentTime)}</h3>
      </div>
    </div>
  </div>
);

export default StatsGrid;
