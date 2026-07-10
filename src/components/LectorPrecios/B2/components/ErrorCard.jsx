import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../../B1/LectorPrecios.module.css";

/**
 * Card de error cuando el producto no se encuentra o el fetch falla.
 * Dividida en dos bloques:
 *  - Izquierdo: ícono de alerta + countdown de regreso
 *  - Derecho: mensaje + consejos de resolución
 */
const ErrorCard = ({ tiempoRestante }) => (
  <div className={`${styles.lectorPreciosCard} ${styles.errorCardLayout}`}>
    <div className={styles.errorIconSection}>
      <div className={styles.alertIconCircle}>
        <FontAwesomeIcon icon={faExclamationTriangle} />
      </div>
      <div className={styles.contadorEsperaBadgeError}>
        <FontAwesomeIcon icon={faClock} /> Regreso en: {tiempoRestante}s
      </div>
    </div>
    <div className={styles.errorTextSection}>
      <h2>PRODUCTO NO ENCONTRADO</h2>
      <p className={styles.errorBrief}>
        No logramos encontrar el producto en nuestra base de datos.
      </p>
      <div className={styles.errorAdviceBox}>
        <h4>¿Qué puede hacer?</h4>
        <ul>
          <li>Intente pasar el producto nuevamente por el escáner.</li>
          <li>Verifique que el código de barras no esté arrugado o sucio.</li>
          <li>
            Solicite asistencia con uno de nuestros asesores en los pasillos.
          </li>
        </ul>
      </div>
    </div>
  </div>
);

export default ErrorCard;
