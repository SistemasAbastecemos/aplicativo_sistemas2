import React from "react";
import styles from "../ProgramacionSeparata.module.css";

const SeparataHeader = () => (
  <header className={styles.header}>
    <div className={styles.headerContent}>
      <h1 className={styles.title}>Programación Separata</h1>
      <p className={styles.subtitle}>
        Gestión y programación de separatas promocionales
      </p>
    </div>
  </header>
);

export default SeparataHeader;
