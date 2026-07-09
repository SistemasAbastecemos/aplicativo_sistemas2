import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import styles from "../Pedidos.module.css";
import { POLITICAS_PEDIDOS } from "../utils/constants";

/**
 * Card de políticas de pedidos. Visible en desktop y en móvil (el
 * comportamiento condicional del legacy se preserva vía CSS).
 */
const PoliciesCard = () => (
  <section className={styles.policiesCard}>
    <div className={styles.policiesHeader}>
      <FontAwesomeIcon icon={faInfoCircle} className={styles.policiesIcon} />
      <h3>Políticas de Pedidos</h3>
    </div>
    <div className={styles.policiesContent}>
      <ul className={styles.policiesList}>
        {POLITICAS_PEDIDOS.map((politica) => (
          <li key={politica}>{politica}</li>
        ))}
      </ul>
    </div>
  </section>
);

export default PoliciesCard;
