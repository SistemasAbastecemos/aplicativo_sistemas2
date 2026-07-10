import React from "react";
import styles from "../../B1/LectorPrecios.module.css";

/**
 * Flecha decorativa que apunta hacia abajo (donde está el escáner
 * físico). Se oculta con clase `ocultar` cuando hay un resultado o error
 * mostrándose.
 */
const FlechaDown = ({ oculta }) => (
  <div
    className={`${styles.lectorPreciosFlecha} ${oculta ? styles.ocultar : ""}`}
  >
    <div className={styles.arrowDown}>
      <div className={styles.arrowTop}></div>
      <div className={styles.arrowMiddle}></div>
      <div className={styles.arrowBottom}></div>
    </div>
  </div>
);

export default FlechaDown;
