import React from "react";
import styles from "../Sedes.module.css";

/** Cabecera fija del módulo con título y subtítulo. */
const SedesHeader = () => (
  <header className={styles.header}>
    <div className={styles.headerContent}>
      <h1 className={styles.title}>Gestión de Sedes</h1>
      <p className={styles.subtitle}>
        Administra y gestiona las sedes de la organización
      </p>
    </div>
  </header>
);

export default SedesHeader;
