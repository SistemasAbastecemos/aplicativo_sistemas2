import React from "react";
import styles from "../Pedidos.module.css";

/**
 * Tooltip flotante que muestra la lista completa de días de pedido de un
 * item. Se posiciona debajo del badge trigger en desktop y como modal
 * centrado en móvil (via CSS responsive).
 */
const DaysTooltip = ({ dias }) => (
  <div className={styles.daysTooltip}>
    <div className={styles.daysTooltipContent}>
      <div className={styles.daysTooltipHeader}>
        <strong>Días de Pedido:</strong>
      </div>
      <div className={styles.daysList}>
        {dias.map((dia, idx) => (
          <span key={idx} className={styles.dayItem}>
            {dia}
          </span>
        ))}
      </div>
    </div>
  </div>
);

export default DaysTooltip;
