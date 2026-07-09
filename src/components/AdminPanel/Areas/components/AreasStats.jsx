import React from "react";
import styles from "../Areas.module.css";

/**
 * Indicadores del conjunto de áreas: total, activas, inactivas y número de
 * páginas. Los conteos de activas/inactivas se calculan sobre lo cargado.
 */
const AreasStats = ({ areas, totalAreas, totalPaginas }) => {
  const activas = areas.filter((a) => a.activo).length;
  const inactivas = areas.filter((a) => !a.activo).length;

  const tarjetas = [
    { valor: totalAreas, etiqueta: "Total áreas" },
    { valor: activas, etiqueta: "Activas" },
    { valor: inactivas, etiqueta: "Inactivas" },
    { valor: totalPaginas, etiqueta: "Páginas" },
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

export default AreasStats;
