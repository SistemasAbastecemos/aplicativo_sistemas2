import React from "react";
import styles from "../Cargos.module.css";

const CargosHeader = React.memo(() => (
  <header className={styles.header}>
    <div className={styles.headerContent}>
      <h1 className={styles.title}>Gestión de Cargos</h1>
      <p className={styles.subtitle}>
        Administra y gestiona los cargos organizacionales de la empresa
      </p>
    </div>
  </header>
));

export default CargosHeader;
