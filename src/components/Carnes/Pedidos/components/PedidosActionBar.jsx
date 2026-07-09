import React from "react";
import styles from "../FormularioPedidos.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faShoppingCart } from "@fortawesome/free-solid-svg-icons";

const PedidosActionBar = React.memo(
  ({ totalKG, cantidadProductos, isVisible, submitting, onConfirm }) => {
    if (!isVisible) return null;

    return (
      <div className={styles.appleActionBarFixed}>
        <div className={styles.actionBarInsideFlex}>
          <div className={styles.summaryLabelTextBlock}>
            <div className={styles.cartCircleIconIndicator}>
              <FontAwesomeIcon icon={faShoppingCart} />
            </div>
            <div>
              <strong>Pedido Configurado</strong>
              <p>
                {totalKG} kg en volumen total • {cantidadProductos} productos
                listos en lote
              </p>
            </div>
          </div>

          <button
            type="button"
            className={styles.appleBtnPrimaryAction}
            disabled={submitting}
            onClick={onConfirm}
          >
            {submitting ? (
              <div className={styles.iosMiniLoaderButton} />
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} /> Confirmar Pedido de Carnes
              </>
            )}
          </button>
        </div>
      </div>
    );
  },
);

PedidosActionBar.displayName = "PedidosActionBar";
export default PedidosActionBar;
