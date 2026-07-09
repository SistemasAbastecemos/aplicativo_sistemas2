import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import styles from "../Dashboard.module.css";
import { getPermisoClass } from "../utils/permisos";

const FuncionCard = ({ item, onNavigate }) => (
  <div
    className={styles.funcionCard}
    onClick={() => onNavigate(item.ruta)}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") onNavigate(item.ruta);
    }}
  >
    <div className={styles.funcionHeader}>
      <div className={styles.funcionTitleContainer}>
        <h4>{item.nombre}</h4>
        {item.tipo === "submenu" && (
          <span className={styles.parentLabel}>{item.parent}</span>
        )}
      </div>
      <FontAwesomeIcon icon={faAngleRight} className={styles.arrowIcon} />
    </div>
    {item.descripcion && (
      <p className={styles.funcionDescription}>{item.descripcion}</p>
    )}
    <div className={styles.permisosContainer}>
      {Object.entries(item.permisos || {}).map(
        ([perm, activo]) =>
          activo && (
            <span
              key={perm}
              className={`${styles.permisoPill} ${getPermisoClass(perm)}`}
            >
              {perm.toUpperCase()}
            </span>
          ),
      )}
    </div>
  </div>
);

export default FuncionCard;
