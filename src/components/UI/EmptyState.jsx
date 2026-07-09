import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./EmptyState.module.css";

/**
 * Componente Atomico Global para Estados Vacios (Agnostico al Dominio).
 * Sigue los lineamientos de diseño minimalista y limpio estilo Apple.
 */
const EmptyState = ({ icon, title, description, children }) => {
  return (
    <div className={styles.emptyStateContainer}>
      <div className={styles.emptyIconWrapper}>
        {typeof icon === "string" ? (
          <span className={styles.stringIcon}>{icon}</span>
        ) : (
          <FontAwesomeIcon icon={icon} />
        )}
      </div>
      <h3 className={styles.emptyTitle}>{title}</h3>
      {description && <p className={styles.emptyDescription}>{description}</p>}

      {/* Zona de composicion flexible para botones o acciones personalizadas */}
      {children && <div className={styles.emptyActions}>{children}</div>}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node,
};

export default React.memo(EmptyState);
