import React from "react";
import styles from "../Menus.module.css";

/**
 * Indicadores analíticos del conjunto de menús: totales, activos,
 * suspendidos y nodos principales (raíz).
 */
const MenusStats = ({ menus, totalMenus }) => {
  const activos = menus.filter((m) => m.activo).length;
  const suspendidos = menus.filter((m) => !m.activo).length;
  const principales = menus.filter((m) => !m.id_parent).length;

  const tarjetas = [
    { valor: totalMenus, etiqueta: "Registros totales" },
    { valor: activos, etiqueta: "Nodos activos" },
    { valor: suspendidos, etiqueta: "Nodos suspendidos" },
    { valor: principales, etiqueta: "Nodos principales" },
  ];

  return (
    <div className={styles.stats}>
      {tarjetas.map((t) => (
        <div key={t.etiqueta} className={styles.statCard}>
          <span className={styles.statNumber}>{t.valor}</span>
          <span className={styles.statLabel}>{t.etiqueta}</span>
        </div>
      ))}
    </div>
  );
};

export default MenusStats;
