import React, { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faIdCard,
  faEnvelope,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Proveedores.module.css";

const ProveedorCard = React.memo(({ proveedor, onEdit }) => {
  const handleEdit = useCallback(() => {
    onEdit(proveedor);
  }, [proveedor, onEdit]);

  const isActivo = proveedor.activo === 1 || proveedor.activo === true;

  return (
    <div
      className={`${styles.proveedorCard} ${isActivo ? styles.activo : styles.inactivo}`}
    >
      <span
        className={`${styles.statusDot} ${isActivo ? styles.dotActivo : styles.dotInactivo}`}
      />

      <div className={styles.cardMain}>
        <div className={styles.avatar}>
          <FontAwesomeIcon icon={faBuilding} />
        </div>
        <div className={styles.details}>
          <h4 className={styles.proveedorName}>{proveedor.nombre}</h4>
          <div className={styles.nitBadge}>
            <FontAwesomeIcon icon={faIdCard} className={styles.metaIcon} />
            <span>NIT: {proveedor.nit}</span>
          </div>
        </div>
      </div>

      <div className={styles.cardMeta}>
        <div className={styles.metaBadge} title={proveedor.correo}>
          <FontAwesomeIcon icon={faEnvelope} className={styles.metaIcon} />
          <span className={styles.emailText}>{proveedor.correo}</span>
        </div>
      </div>

      <div className={styles.cardActions}>
        <button className={styles.editActionBtn} onClick={handleEdit}>
          <FontAwesomeIcon icon={faEdit} />
          <span>Propiedades</span>
        </button>
      </div>
    </div>
  );
});

export default ProveedorCard;
