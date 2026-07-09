import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan } from "@fortawesome/free-solid-svg-icons";
import styles from "../Informes.module.css";
import { getAreaIcon } from "../utils/areaStyles";

/**
 * Convierte un color hex a rgba con la opacidad indicada.
 * Fallback silencioso al color por defecto si el input es inválido.
 */
const hexToRgba = (hex, alpha) => {
  const clean = (hex || "").replace("#", "");
  if (clean.length !== 6) return `rgba(59, 130, 246, ${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const InformeCard = ({ informe, onClick }) => {
  const isInactivo = Number(informe.activo) === 0;
  const colorInforme = informe.color || "#3b82f6";

  // Estilos dinámicos derivados del color del informe
  const cardStyle = !isInactivo
    ? {
        borderTop: `3px solid ${colorInforme}`,
      }
    : undefined;

  const iconWrapperStyle = !isInactivo
    ? {
        backgroundColor: hexToRgba(colorInforme, 0.1),
        color: colorInforme,
      }
    : undefined;

  const badgeStyle = !isInactivo
    ? {
        backgroundColor: hexToRgba(colorInforme, 0.08),
        color: colorInforme,
      }
    : undefined;

  return (
    <div
      className={`${styles.card} ${isInactivo ? styles.disabled : ""}`}
      style={cardStyle}
      onClick={() => onClick(informe)}
    >
      <div className={styles.cardHeader}>
        <div
          className={`${styles.cardIconWrapper} ${
            isInactivo ? styles.areaDisabled : ""
          }`}
          style={iconWrapperStyle}
        >
          <FontAwesomeIcon
            icon={isInactivo ? faBan : getAreaIcon(informe.area_nombre)}
          />
        </div>
        <span
          className={`${styles.cardBadge} ${
            isInactivo ? styles.badgeDisabled : ""
          }`}
          style={badgeStyle}
        >
          {isInactivo ? "Suspendido" : informe.area_nombre}
        </span>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{informe.titulo}</h3>
        <p className={styles.cardText}>{informe.descripcion}</p>
      </div>
    </div>
  );
};

export default InformeCard;
