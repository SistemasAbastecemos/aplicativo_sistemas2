import React from "react";
import styles from "../PlanosContables.module.css";

const PlanosHeader = () => (
  <header className={styles.header}>
    <div className={styles.headerContent}>
      <h1 className={styles.title}>Planos Contables y Retenciones</h1>
      <p className={styles.subtitle}>
        Administración de archivos base y políticas de generación de
        certificados
      </p>
    </div>
  </header>
);

export default PlanosHeader;
