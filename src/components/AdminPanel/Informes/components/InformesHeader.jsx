import React from "react";
import styles from "../Informes.module.css";

/** * Cabecera fija de la sección analítica.
 * Diseño de alta fidelidad estilo macOS.
 */
const InformesHeader = React.memo(() => (
  <div className={styles.header}>
    <div className={styles.headerContent}>
      <h1 className={styles.title}>Estructura Jerárquica Analítica</h1>
      <p className={styles.subtitle}>
        Administración secuencial y asignación de atributos de acceso
        corporativo
      </p>
    </div>
  </div>
));

export default InformesHeader;
