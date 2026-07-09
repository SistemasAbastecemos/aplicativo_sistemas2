import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDay } from "@fortawesome/free-solid-svg-icons";
import styles from "../Pedidos.module.css";
import DaysTooltip from "./DaysTooltip";

/**
 * Celda de días con badge clickeable. Al click abre el tooltip con la
 * lista completa. Si no hay días, muestra un "-".
 *
 * El atributo `data-days-container` es usado por `useDaysTooltip` para
 * detectar clicks fuera y cerrar el tooltip.
 */
const DaysCell = ({ dias, isExpanded, onToggle }) => {
  if (dias.length === 0) {
    return <span className={styles.noDays}>-</span>;
  }

  return (
    <div
      className={styles.daysContainer}
      data-days-container="true"
      onClick={onToggle}
    >
      <span
        className={`${styles.daysText} ${isExpanded ? styles.daysTextExpanded : ""}`}
        title={isExpanded ? "Click para cerrar" : "Click para ver días"}
      >
        <FontAwesomeIcon icon={faCalendarDay} className={styles.daysIcon} />
        {dias.length} días
      </span>
      {isExpanded && <DaysTooltip dias={dias} />}
    </div>
  );
};

export default DaysCell;
