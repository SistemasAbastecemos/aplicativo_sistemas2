import React from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./LoadingScreen.module.css";

// Componente global de carga optimizado y extensible
const LoadingScreen = ({
  title = "Cargando...",
  subtitle,
  variant = "fullscreen",
  isVisible = true,
}) => {
  // Validacion defensiva para evitar renderizados vacios inconsistentes
  if (!isVisible) return null;

  const isFullscreen = variant === "fullscreen";

  const content = (
    <div
      className={isFullscreen ? styles.loadingOverlay : styles.inlineContainer}
    >
      <div className={styles.loadingContainer}>
        {/* Spinner de doble rebote */}
        <div className={styles.spinner} aria-hidden="true">
          <div className={styles.doubleBounce1}></div>
          <div className={styles.doubleBounce2}></div>
        </div>

        {/* Contenido textual controlado defensivamente */}
        {title && <h3 className={styles.loadingTitle}>{title}</h3>}
        {subtitle && <p className={styles.loadingSubtitle}>{subtitle}</p>}
      </div>
    </div>
  );

  // Si es pantalla completa, aplicamos animaciones fluidas de montaje/desmontaje
  if (isFullscreen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ position: "fixed", zIndex: 9999, top: 0, left: 0 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    );
  }

  return content;
};

// Tipado estricto para mantener la robustez del componente en el tiempo
LoadingScreen.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  variant: PropTypes.oneOf(["fullscreen", "inline"]),
  isVisible: PropTypes.bool,
};

export default LoadingScreen;
