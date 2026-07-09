import React, { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup, faEdit } from "@fortawesome/free-solid-svg-icons";
import styles from "../Areas.module.css";

/**
 * Tarjeta de un área. Memoizada porque se renderiza en lista. Muestra el
 * estado (activo/inactivo), el nombre y una acción para configurar.
 */
const AreaCard = React.memo(({ area, onEdit }) => {
  const handleEdit = useCallback(() => onEdit(area), [area, onEdit]);

  return (
    <div
      className={`${styles.areaCard} ${area.activo ? styles.activo : styles.inactivo}`}
    >
      <span
        className={styles.statusDot}
        title={area.activo ? "Activo" : "Inactivo"}
      />

      <div className={styles.cardMain}>
        <div className={styles.avatar}>
          <FontAwesomeIcon icon={faLayerGroup} />
        </div>

        <div className={styles.details}>
          <h4 className={styles.areaName}>{area.descripcion}</h4>
          <span className={styles.statusText}>
            Área {area.activo ? "operativa en sistema" : "fuera de servicio"}
          </span>
        </div>
      </div>

      <div className={styles.cardActions}>
        <button className={styles.editActionBtn} onClick={handleEdit}>
          <FontAwesomeIcon icon={faEdit} />
          <span>Configurar área</span>
        </button>
      </div>
    </div>
  );
});

AreaCard.displayName = "AreaCard";

export default AreaCard;
