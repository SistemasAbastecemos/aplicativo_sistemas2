import React from "react";
import styles from "../PermisosInventario.module.css";

const PermisosHeader = React.memo(() => (
  <div className={styles.header}>
    <div className={styles.headerContent}>
      <h1 className={styles.title}>Matriz de Permisos de Inventario</h1>
      <p className={styles.subtitle}>
        Configuración unificada y granular para la visualización de saldos de
        inventarios desde la plataforma de proveedores
      </p>
    </div>
  </div>
));

export default PermisosHeader;
