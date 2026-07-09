import React, { useMemo } from "react";
import styles from "../ExistenciasAverias.module.css";
import { formatearCOP } from "../utils/helpers";

/**
 * Muestra 3 KPIs de resumen del reporte:
 *  - Fecha de ejecución (hoy)
 *  - Total de items con novedad
 *  - Valor total de costo acumulado
 */
const TarjetasKpi = ({ datos }) => {
  const { totalItems, costoTotal } = useMemo(() => {
    const total = datos.length;
    const costo = datos.reduce(
      (acc, current) => acc + parseFloat(current.costo_total || 0),
      0,
    );
    return { totalItems: total, costoTotal: costo };
  }, [datos]);

  return (
    <div className={styles.seccionKpiContenedor}>
      <div className={styles.tarjetaKpiItem}>
        <h2>{new Date().toLocaleDateString("es-CO")}</h2>
        <p>Fecha de ejecución</p>
      </div>
      <div className={styles.tarjetaKpiItem}>
        <h2>{totalItems.toLocaleString("es-CO")}</h2>
        <p>Ítems con Novedad</p>
      </div>
      <div className={styles.tarjetaKpiItem}>
        <h2>{formatearCOP(costoTotal)}</h2>
        <p>Valor Total Costo</p>
      </div>
    </div>
  );
};

export default TarjetasKpi;
