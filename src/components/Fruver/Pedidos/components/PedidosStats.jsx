import React from "react";
import styles from "../Pedidos.module.css";

/**
 * Grid de 4 cards con métricas del listado actual:
 *  - Items filtrados
 *  - Pedidos marcados
 *  - Total de páginas
 *  - % de completado (pedidos / filtrados)
 */
const PedidosStats = ({ totalFiltrados, totalPedidos, totalPaginas }) => {
  const porcentajeCompletado =
    totalFiltrados > 0
      ? Math.round((totalPedidos / totalFiltrados) * 100)
      : 0;

  return (
    <div className={styles.stats}>
      <div className={styles.statCard}>
        <span className={styles.statNumber}>{totalFiltrados}</span>
        <span className={styles.statLabel}>Items filtrados</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statNumber}>{totalPedidos}</span>
        <span className={styles.statLabel}>Pedidos</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statNumber}>{totalPaginas}</span>
        <span className={styles.statLabel}>Páginas</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statNumber}>{porcentajeCompletado}%</span>
        <span className={styles.statLabel}>Completado</span>
      </div>
    </div>
  );
};

export default PedidosStats;
