import React from "react";
import styles from "../FormularioPedidos.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMinus,
  faWeightHanging,
  faCube,
} from "@fortawesome/free-solid-svg-icons";

export const PedidosItemsGrid = React.memo(
  ({ items, cantidades, onAdjust, onChange }) => {
    return (
      <div className={styles.itemsResponsiveGridCanvas}>
        {items.map((product) => {
          const cantidadActual = cantidades[product.id] || "";
          const tieneValor = parseFloat(cantidadActual) > 0;
          const esUnd = product.unidad_medida === "UND";

          return (
            <div key={product.id} className={styles.productAppleBentoCard}>
              <div className={styles.productCardHeader}>
                <span className={styles.itemCodeIndicator}>
                  ITEM {product.id_item}
                </span>
                {tieneValor && (
                  <span className={styles.activeSelectionIndicatorIndicator}>
                    <FontAwesomeIcon icon={faCube} /> Seleccionado
                  </span>
                )}
              </div>

              <h3 className={styles.productCardTitle}>{product.descripcion}</h3>

              <div className={styles.weightMetrciBadge}>
                <FontAwesomeIcon icon={faWeightHanging} /> Unidad:{" "}
                <strong>{product.unidad_medida}</strong>
              </div>

              <div className={styles.iosStepperControlGroup}>
                <button
                  type="button"
                  className={styles.btnStepperAction}
                  onClick={() =>
                    onAdjust(
                      product.id,
                      esUnd ? -1 : -10,
                      product.unidad_medida,
                    )
                  }
                  disabled={!cantidadActual || parseFloat(cantidadActual) <= 0}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>

                <input
                  type="number"
                  min="0"
                  step={esUnd ? "1" : "10"}
                  className={styles.inputStepperQuantity}
                  value={cantidadActual}
                  onChange={(e) =>
                    onChange(product.id, e.target.value, product.unidad_medida)
                  }
                  placeholder="0"
                />

                <button
                  type="button"
                  className={styles.btnStepperAction}
                  onClick={() =>
                    onAdjust(product.id, esUnd ? 1 : 10, product.unidad_medida)
                  }
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);

PedidosItemsGrid.displayName = "PedidosItemsGrid";
