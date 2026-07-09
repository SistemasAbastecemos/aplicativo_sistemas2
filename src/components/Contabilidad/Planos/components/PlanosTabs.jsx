import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudUploadAlt,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../PlanosContables.module.css";

/**
 * Tabs de navegación entre "Carga de Archivos" y "Políticas y
 * Restricciones". Presentacional puro; el estado activo lo maneja el
 * orquestador.
 */
const PlanosTabs = ({ activeTab, onChangeTab }) => (
  <nav className={styles.tabsContainer}>
    <button
      className={`${styles.tab} ${activeTab === "carga" ? styles.activeTab : ""}`}
      onClick={() => onChangeTab("carga")}
      type="button"
    >
      <FontAwesomeIcon icon={faCloudUploadAlt} />
      <span>Carga de Archivos</span>
    </button>
    <button
      className={`${styles.tab} ${activeTab === "configuracion" ? styles.activeTab : ""}`}
      onClick={() => onChangeTab("configuracion")}
      type="button"
    >
      <FontAwesomeIcon icon={faCog} />
      <span>Políticas y Restricciones</span>
    </button>
  </nav>
);

export default PlanosTabs;
