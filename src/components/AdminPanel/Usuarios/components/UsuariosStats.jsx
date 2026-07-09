import React from "react";
import styles from "../Usuarios.module.css";

/**
 * Indicadores del conjunto de usuarios: total, activos, inactivos y número
 * de páginas. Activos/inactivos se calculan sobre lo cargado.
 */
const UsuariosStats = React.memo(
  ({ usuarios, totalUsuarios, totalPaginas }) => {
    const activos = usuarios.filter((u) => u.activo).length;
    const inactivos = usuarios.filter((u) => !u.activo).length;

    const tarjetas = [
      { valor: totalUsuarios, etiqueta: "Total usuarios" },
      { valor: activos, etiqueta: "Activos" },
      { valor: inactivos, etiqueta: "Inactivos" },
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
  },
);

UsuariosStats.displayName = "UsuariosStats";

export default UsuariosStats;
