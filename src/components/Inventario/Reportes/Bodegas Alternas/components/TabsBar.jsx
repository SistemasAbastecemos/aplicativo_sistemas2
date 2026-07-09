import React from "react";
import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";
import { faTable, faCogs } from "@fortawesome/free-solid-svg-icons";
import { TABS_BODEGAS } from "../utils/constants";
import styles from "../BodegasAlternas.module.css";

const TabsBar = ({ activeTab, onChangeTab, tieneAccesoParametros }) => {
  return (
    <div className={styles.tabsContainer}>
      <button
        className={`${styles.tabButton} ${activeTab === TABS_BODEGAS.ANALITICA ? styles.tabActive : ""}`}
        onClick={() => onChangeTab(TABS_BODEGAS.ANALITICA)}
        type="button"
      >
        <FA icon={faTable} /> Visor
      </button>

      <button
        className={`${styles.tabButton} ${activeTab === TABS_BODEGAS.PARAMETROS ? styles.tabActive : ""}`}
        onClick={() => {
          if (tieneAccesoParametros) {
            onChangeTab(TABS_BODEGAS.PARAMETROS);
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
        <FA icon={faCogs} /> Parametrización
      </button>
    </div>
  );
};

export default TabsBar;
