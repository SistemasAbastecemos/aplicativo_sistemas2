import React from "react";
import styles from "../../B1/LectorPrecios.module.css";

/**
 * Overlay que se muestra durante la consulta al backend. Bloquea la
 * pantalla con un spinner grande y un mensaje. NO se usa el
 * LoadingScreen global porque este terminal es fullscreen en landscape
 * y necesita un tratamiento visual específico (tipografía grande,
 * fondo con blur).
 */
const LoadingOverlay = () => (
  <div className={styles.fullscreenLoading}>
    <div className={styles.spinner}></div>
    <p>Consultando base de datos...</p>
  </div>
);

export default LoadingOverlay;
