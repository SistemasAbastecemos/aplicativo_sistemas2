import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDay,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Recaudos.module.css";

/**
 * Selector visual entre "Rango de Fechas" y "Por Lapso". Renderizado como
 * dos cards clickeables que resaltan cuando están activos (verde
 * corporativo).
 */
const TipoFiltroSelector = ({ tipoFiltro, onChange }) => (
  <div className={styles.grupoSelector}>
    <label className={styles.etiquetaPrincipal}>Tipo de Búsqueda</label>
    <div className={styles.radioContainer}>
      <label
        className={`${styles.radioOpcion} ${
          tipoFiltro === "fecha" ? styles.activo : ""
        }`}
      >
        <input
          type="radio"
          value="fecha"
          checked={tipoFiltro === "fecha"}
          onChange={(e) => onChange(e.target.value)}
        />
        <FontAwesomeIcon icon={faCalendarDay} />
        <span>Rango de Fechas</span>
      </label>
      <label
        className={`${styles.radioOpcion} ${
          tipoFiltro === "lapso" ? styles.activo : ""
        }`}
      >
        <input
          type="radio"
          value="lapso"
          checked={tipoFiltro === "lapso"}
          onChange={(e) => onChange(e.target.value)}
        />
        <FontAwesomeIcon icon={faCalendarAlt} />
        <span>Por Lapso</span>
      </label>
    </div>
  </div>
);

export default TipoFiltroSelector;
