import React from "react";
import styles from "../Areas.module.css";

/** Cabecera fija del módulo con título y subtítulo. */
const AreasHeader = () => (
  <div className={styles.header}>
    <div className={styles.headerContent}>
      <h1 className={styles.title}>Gestión de Áreas</h1>
      <p className={styles.subtitle}>
        Administra y gestiona las áreas organizacionales
      </p>
    </div>
  </div>
);

export default AreasHeader;
