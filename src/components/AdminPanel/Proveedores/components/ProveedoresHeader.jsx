import React from "react";
import styles from "../Proveedores.module.css";

const ProveedoresHeader = React.memo(({ totalDisponibles }) => (
  <header className={styles.header}>
    <div className={styles.headerContent}>
      <h1 className={styles.title}>Registro de Proveedores</h1>
      <p className={styles.subtitle}>
        Directorio analítico de aliados comerciales y credenciales de acceso
      </p>
      <div className={styles.kpiGroup}>
        <div className={styles.kpiBadge}>
          <span className={styles.kpiLabel}>Aliados Activos</span>
          <span className={styles.kpiValue}>{totalDisponibles}</span>
        </div>
      </div>
    </div>
  </header>
));

export default ProveedoresHeader;
