import React, { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faEdit } from "@fortawesome/free-solid-svg-icons";
import styles from "../Cargos.module.css";

const CargoCard = React.memo(({ cargo, areas, onEdit }) => {
  const handleEdit = useCallback(() => {
    onEdit(cargo);
  }, [cargo, onEdit]);

  const area = areas.find((a) => a.id === cargo.id_area);

  const getNivelLabel = (nivel) => {
    if (nivel === 1) return "Operativo";
    if (nivel === 2) return "Táctico";
    if (nivel === 3) return "Estratégico";
    return "No asignado";
  };

  const isActivo = cargo.activo === 1 || cargo.activo === true;

  return (
    <div
      className={`${styles.cargoCard} ${isActivo ? styles.activo : styles.inactivo}`}
    >
      <span
        className={`${styles.statusDot} ${isActivo ? styles.dotActivo : styles.dotInactivo}`}
      />

      <div className={styles.cardMain}>
        <div className={styles.avatar}>
          <FontAwesomeIcon icon={faBriefcase} />
        </div>
        <div className={styles.details}>
          <h4 className={styles.cargoName}>{cargo.nombre}</h4>
          <span className={styles.areaText}>
            {area?.nombre || area?.descripcion || "Sin área asociada"}
          </span>
        </div>
      </div>

      <div className={styles.cardMeta}>
        <div
          className={`${styles.levelBadge} ${styles[`level${cargo.nivel}`]}`}
        >
          <span>Nivel: {getNivelLabel(cargo.nivel)}</span>
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

export default CargoCard;
