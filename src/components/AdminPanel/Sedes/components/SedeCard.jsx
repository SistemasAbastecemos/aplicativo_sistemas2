import React, { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faEdit,
  faMapMarkerAlt,
  faHashtag,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Sedes.module.css";

/**
 * Tarjeta de una sede. Memoizada porque se renderiza en lista. Muestra
 * estado, nombre, ubicación y metadatos, con acción para editar.
 */
const SedeCard = React.memo(({ sede, onEdit }) => {
  const handleEdit = useCallback(() => onEdit(sede), [sede, onEdit]);

  const isActivo = sede.activo == 1 || sede.activo === true;

  return (
    <div className={styles.sedeCard}>
      <span
        className={`${styles.statusDot} ${isActivo ? styles.dotActivo : styles.dotInactivo}`}
        title={isActivo ? "Sucursal Activa" : "Sucursal Inactiva"}
      />

      <div className={styles.cardMain}>
        <div className={styles.avatar}>
          <FontAwesomeIcon icon={faBuilding} />
        </div>

        <div className={styles.details}>
          <h4 className={styles.sedeName}>{sede.nombre}</h4>
          <p className={styles.locationSummary}>
            {sede.ciudad || "Sin ciudad"}
            {sede.departamento ? `, ${sede.departamento}` : ""}
          </p>
        </div>
      </div>

      {(sede.direccion || sede.telefono) && (
        <div className={styles.cardMeta}>
          {sede.direccion && (
            <div className={styles.metaBadge} title="Dirección">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className={styles.metaIcon}
              />
              <span>{sede.direccion}</span>
            </div>
          )}
          {sede.telefono && (
            <div className={styles.metaBadge} title="Teléfono">
              <FontAwesomeIcon icon={faHashtag} className={styles.metaIcon} />
              <span>{sede.telefono}</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.cardActions}>
        <button className={styles.editActionBtn} onClick={handleEdit}>
          <FontAwesomeIcon icon={faEdit} />
          <span>Propiedades</span>
        </button>
      </div>
    </div>
  );
});

SedeCard.displayName = "SedeCard";

export default SedeCard;
