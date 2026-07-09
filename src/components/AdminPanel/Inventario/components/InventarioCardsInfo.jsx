import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileAlt,
  faExclamationTriangle,
  faWarehouse,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../ActualizarInventario.module.css";

const InventarioCardsInfo = React.memo(() => (
  <div className={styles.infoCards}>
    <div className={styles.infoCard}>
      <div className={styles.infoIconBlue}>
        <FontAwesomeIcon icon={faFileAlt} />
      </div>
      <div className={styles.infoContent}>
        <h4>Formato Requerido</h4>
        <p>
          Asegúrate de que el archivo Excel tenga las columnas correctas según
          el tipo de inventario seleccionado.
        </p>
      </div>
    </div>

    <div className={styles.infoCard}>
      <div className={styles.infoIconAmber}>
        <FontAwesomeIcon icon={faExclamationTriangle} />
      </div>
      <div className={styles.infoContent}>
        <h4>Precaución</h4>
        <p>
          La actualización reemplazará los registros existentes. Verifica la
          información antes de subir.
        </p>
      </div>
    </div>

    <div className={styles.infoCard}>
      <div className={styles.infoIconGreen}>
        <FontAwesomeIcon icon={faWarehouse} />
      </div>
      <div className={styles.infoContent}>
        <h4>Gestión Centralizada</h4>
        <p>
          Mantén tu inventario actualizado para un mejor control de los equipos
          POS.
        </p>
      </div>
    </div>
  </div>
));

export default InventarioCardsInfo;
