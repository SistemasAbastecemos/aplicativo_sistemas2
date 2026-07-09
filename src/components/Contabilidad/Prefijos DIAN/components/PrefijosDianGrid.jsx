import React from "react";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons";
import EmptyState from "../../../UI/EmptyState";
import { TabAuditoriaMatriz } from "./TabAuditoriaMatriz";
import styles from "../PrefijosDian.module.css";

const PrefijosDianGrid = ({ model, formatMiles }) => {
  if (model.columnas.length === 0 || model.reporte.length === 0) {
    return (
      <div className={styles.vacioContainerCanvas}>
        <EmptyState
          icon={faClipboardList}
          title="Consolidado Matricial Vacio"
          description="Por favor, seleccione un rango de fechas y ejecute la consulta para procesar el cruce de informacion fiscal."
        />
      </div>
    );
  }

  return (
    <TabAuditoriaMatriz
      columnas={model.columnas}
      reporte={model.reporte}
      datosDian={model.datosDian}
      maestroDianActivo={model.maestroDianActivo}
      formatMiles={formatMiles}
      diasConciliados={model.diasConciliados}
    />
  );
};

export default PrefijosDianGrid;
