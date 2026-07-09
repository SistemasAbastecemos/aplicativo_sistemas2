import React, { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Pedidos.module.css";
import DaysCell from "./DaysCell";
import { formatearDias } from "../utils/helpers";

/**
 * Fila individual de la tabla de pedidos. Memoizada porque en una lista
 * de 15 items con toggles rápidos, evitar re-renders innecesarios es
 * importante para la fluidez.
 *
 * El data-label en cada `<td>` permite el reflow a cards apiladas en
 * móvil (definido en el CSS responsive).
 */
const TableRow = React.memo(
  ({ item, index, isPedido, onTogglePedido, isExpanded, onToggleDays }) => {
    const handleToggle = useCallback(() => {
      onTogglePedido(item.item);
    }, [item.item, onTogglePedido]);

    const handleDaysClick = useCallback(
      (e) => {
        e.stopPropagation();
        onToggleDays(item.item);
      },
      [item.item, onToggleDays],
    );

    const dias = formatearDias(item.dias_pedido);

    return (
      <tr
        className={`${styles.tableRow} ${isPedido ? styles.rowSelected : ""}`}
      >
        <td className={styles.indexCell} data-label="#">
          {index + 1}
        </td>
        <td className={styles.itemCode} data-label="Item">
          {item.item}
        </td>
        <td
          className={styles.itemDescription}
          title={item.descripcion}
          data-label="Descripción"
        >
          {item.descripcion}
        </td>
        <td className={styles.diasCell} data-label="Días">
          <DaysCell
            dias={dias}
            isExpanded={isExpanded}
            onToggle={handleDaysClick}
          />
        </td>
        <td className={styles.comprador} data-label="Comprador">
          <div className={styles.compradorContent}>
            <FontAwesomeIcon icon={faUser} className={styles.compradorIcon} />
            <span title={item.comprador}>{item.comprador}</span>
          </div>
        </td>
        <td className={styles.statusCell} data-label="Estado">
          <span
            className={`${styles.statusBadge} ${
              isPedido ? styles.statusPedido : styles.statusPendiente
            }`}
          >
            <FontAwesomeIcon icon={isPedido ? faCheckCircle : faTimesCircle} />
            {isPedido ? "Pedido" : "Pendiente"}
          </span>
        </td>
        <td className={styles.actionCell} data-label="Acción">
          <button
            className={`${styles.pedidoButton} ${
              isPedido ? styles.pedidoSelected : ""
            }`}
            onClick={handleToggle}
            title={isPedido ? "Quitar del pedido" : "Agregar al pedido"}
            type="button"
          >
            <FontAwesomeIcon icon={isPedido ? faTimesCircle : faCheckCircle} />
            <span>{isPedido ? "Quitar" : "Pedir"}</span>
          </button>
        </td>
      </tr>
    );
  },
);

TableRow.displayName = "TableRow";

export default TableRow;
