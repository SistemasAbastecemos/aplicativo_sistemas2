import React from "react";
import styles from "../../B1/LectorPrecios.module.css";

const ClockBar = ({ fechaHora }) => (
  <div className={styles.lectorPreciosTimeRow}>
    <div className={styles.lectorPreciosHeaderTime}>
      <div className={styles.timeText}>{fechaHora}</div>
    </div>
  </div>
);

export default ClockBar;
