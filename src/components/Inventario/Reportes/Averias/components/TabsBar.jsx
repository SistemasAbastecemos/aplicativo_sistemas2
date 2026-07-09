import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTable, faCogs } from "@fortawesome/free-solid-svg-icons";
import styles from "../ExistenciasAverias.module.css";

const TabsBar = ({ activeTab, onChangeTab, permisos = {} }) => {
  // Se evalúa si tiene el privilegio para operar la pestaña
  const tieneAccesoParametros = !!(
    permisos.crear ||
    permisos.editar ||
    permisos.eliminar
  );

  return (
    <div className={styles.tabsContainer}>
      <button
        className={`${styles.tabButton} ${activeTab === "analitica" ? styles.tabActive : ""}`}
        onClick={() => onChangeTab("analitica")}
        type="button"
      >
        <FontAwesomeIcon icon={faTable} className={styles.btnIconoMargen} />
        <span>Visor Analítico</span>
      </button>

      <button
        className={`${styles.tabButton} ${activeTab === "parametros" ? styles.tabActive : ""}`}
        onClick={() => {
          if (tieneAccesoParametros) {
            onChangeTab("parametros");
          }
        }}
        type="button"
        disabled={!tieneAccesoParametros}
        title={
          !tieneAccesoParametros
            ? "No posee permisos de administración para este maestro"
            : undefined
        }
        style={{
          opacity: tieneAccesoParametros ? 1 : 0.5,
          cursor: tieneAccesoParametros ? "pointer" : "not-allowed",
        }}
      >
        <FontAwesomeIcon icon={faCogs} className={styles.btnIconoMargen} />
        <span>Parametrización</span>
      </button>
    </div>
  );
};

export default TabsBar;
