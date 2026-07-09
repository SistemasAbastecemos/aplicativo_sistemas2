import React from "react";
import styles from "../Pedidos.module.css";

const PedidosHeader = () => (
  <header className={styles.header}>
    <div className={styles.headerContent}>
      <h1 className={styles.title}>Pedidos Fruver</h1>
      <p className={styles.subtitle}>
        Gestiona y realiza seguimiento de los pedidos diarios
      </p>
    </div>
  </header>
);

export default PedidosHeader;
