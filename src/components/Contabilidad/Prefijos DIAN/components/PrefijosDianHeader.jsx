import React from "react";
import styles from "../PrefijosDian.module.css";

const PrefijosDianHeader = React.memo(() => (
  <header className={styles.header}>
    <div className={styles.headerContent}>
      <h1 className={styles.title}>
        Auditoría de Prefijos & Conciliación DIAN
      </h1>
      <p className={styles.subtitle}>
        Cuadro de control cruzado entre transacciones Siesa ERP y el repositorio
        XML de la DIAN
      </p>
    </div>
  </header>
));

PrefijosDianHeader.displayName = "PrefijosDianHeader";
export default PrefijosDianHeader;
