import React from "react";
import styles from "../AdministrarItems.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faCalendarAlt,
  faUser,
  faUserShield,
  faUserAlt,
} from "@fortawesome/free-solid-svg-icons";

const ItemCard = React.memo(({ item, onEditClick }) => {
  const diasArray = item.dias_pedido
    ? item.dias_pedido
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean)
    : [];

  const esAdmin = String(item.administrador) === "1";

  return (
    <div className={styles.itemBentoCard}>
      <div className={styles.cardHeaderFlex}>
        <span className={styles.badgeCodigoRef}>{item.item}</span>
        <div className={styles.cardHeaderActionsRight}>
          <span className={esAdmin ? styles.badgeAdminSi : styles.badgeAdminNo}>
            <FontAwesomeIcon icon={esAdmin ? faUserShield : faUserAlt} />{" "}
            {esAdmin ? "Admin" : "Estándar"}
          </span>
          <button
            type="button"
            onClick={() => onEditClick(item)}
            className={styles.btnActionEditCircle}
            title="Editar Parámetros"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
        </div>
      </div>

      <h3 className={styles.itemCardTitle}>{item.descripcion}</h3>

      {item.comprador && (
        <p className={styles.buyerTextIndicator}>
          <FontAwesomeIcon icon={faUser} /> Comprador:{" "}
          <strong>{item.comprador}</strong>
        </p>
      )}

      <p className={styles.itemCardDesc}>
        {item.observaciones || "Sin observaciones registradas."}
      </p>

      <div className={styles.diasAsignadosFooter}>
        <div className={styles.titleDiasLabel}>
          <FontAwesomeIcon icon={faCalendarAlt} /> Días de Operación
        </div>
        <div className={styles.pillsFlexContainer}>
          {diasArray.length > 0 ? (
            diasArray.map((d) => (
              <span key={d} className={styles.dayOperationPill}>
                {d.substring(0, 3)}
              </span>
            ))
          ) : (
            <span className={styles.noDaysWarningPill}>No asignado</span>
          )}
        </div>
      </div>
    </div>
  );
});

ItemCard.displayName = "ItemCard";
export default ItemCard;
