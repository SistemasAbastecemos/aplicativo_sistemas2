import React from "react";
import styles from "../Sedes.module.css";

/**
 * Indicadores del conjunto de sedes: total, activas, inactivas y número de
 * páginas. Los conteos de activas/inactivas se calculan sobre lo cargado.
 */
const SedesStats = ({ sedes, totalSedes, totalPaginas }) => {
  const activas = sedes.filter(
    (s) => s.activo == 1 || s.activo === true,
  ).length;
  const inactivas = sedes.filter(
    (s) => s.activo == 0 || s.activo === false,
  ).length;

  const tarjetas = [
    { valor: totalSedes, etiqueta: "Total sedes" },
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

export default SedesStats;
