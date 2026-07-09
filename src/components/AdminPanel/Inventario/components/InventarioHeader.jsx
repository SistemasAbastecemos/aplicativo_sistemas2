import React from "react";
import styles from "../ActualizarInventario.module.css";

const InventarioHeader = React.memo(() => (
  <header className={styles.header}>
    <div className={styles.headerContent}>
      <h1 className={styles.title}>Actualizar Inventario</h1>
      <p className={styles.subtitle}>
        Gestión y actualización del inventario de equipos POS
      </p>
    </div>
  </header>
));

export default InventarioHeader;
