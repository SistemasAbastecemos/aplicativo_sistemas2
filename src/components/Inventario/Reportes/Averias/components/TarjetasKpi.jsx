import React from "react";
import styles from "../ExistenciasAverias.module.css";

const TarjetasKpi = ({ datos }) => {
  const totalItems = datos.length;

  const costoTotalAcumulado = datos.reduce(
    (acc, current) => acc + parseFloat(current.costo_total || 0),
    0,
  );

  const formatPesosColombianos = (valor) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  return (
    <div className={styles.seccionKpiContenedor}>
      <div className={styles.tarjetaKpiItem}>
        <h2>{new Date().toLocaleDateString("es-CO")}</h2>
        <p>Fecha de ejecucion</p>
      </div>
      <div className={styles.tarjetaKpiItem}>
        <h2>{totalItems.toLocaleString("es-CO")}</h2>
        <p>Items con Novedad</p>
      </div>
      <div className={styles.tarjetaKpiItem}>
        <h2>{formatPesosColombianos(costoTotalAcumulado)}</h2>
        <p>Valor Total Costo</p>
      </div>
    </div>
  );
};

export default TarjetasKpi;
