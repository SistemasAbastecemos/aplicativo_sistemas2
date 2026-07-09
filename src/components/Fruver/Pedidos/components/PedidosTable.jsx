import React from "react";
import styles from "../Pedidos.module.css";
import TableRow from "./TableRow";

/**
 * Tabla de pedidos. Puramente presentacional: recibe los items ya
 * filtrados y paginados desde el orquestador junto con los callbacks
 * necesarios para marcar pedidos y expandir el tooltip de días.
 *
 * En móvil, la tabla se convierte en cards apiladas usando el
 * atributo `data-label` de cada `<td>` (CSS responsive).
 */
const PedidosTable = ({
  items,
  startIndex,
  pedidos,
  expandedId,
  onTogglePedido,
  onToggleDays,
}) => (
  <div className={styles.tableContainer}>
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.colIndex}>#</th>
            <th className={styles.colItem}>Item</th>
            <th className={styles.colDesc}>Descripción</th>
            <th className={styles.colDias}>Días</th>
            <th className={styles.colComprador}>Comprador</th>
            <th className={styles.colEstado}>Estado</th>
            <th className={styles.colAccion}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <TableRow
              key={item.item}
              item={item}
              index={startIndex + index}
              isPedido={pedidos.has(item.item)}
              onTogglePedido={onTogglePedido}
              isExpanded={expandedId === item.item}
              onToggleDays={onToggleDays}
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default PedidosTable;
