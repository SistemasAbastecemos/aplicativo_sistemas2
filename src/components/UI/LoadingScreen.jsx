import React from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./LoadingScreen.module.css";

// Componente de carga modular alineado a lineamientos de diseno de Apple
const LoadingScreen = ({
  title = "Autenticando",
  subtitle = "Por favor espera un momento...",
  variant = "fullscreen",
  isVisible = true,
}) => {
  if (!isVisible) return null;

  const isFullscreen = variant === "fullscreen";

  const content = (
    <div
      className={isFullscreen ? styles.loadingOverlay : styles.inlineContainer}
    >
      <div className={styles.loadingContainer}>
        {/* Spinner Circular Continuo Estilo Apple */}
        <div className={styles.spinnerWrapper} aria-hidden="true">
          <div className={styles.appleSpinner}>
            {[...Array(12)].map((_, index) => (
              <div key={index} className={styles.spinnerBlade} />
            ))}
          </div>
        </div>

        {/* Bloque Textual con Jerarquia de Grises */}
        {title && <h3 className={styles.loadingTitle}>{title}</h3>}
        {subtitle && <p className={styles.loadingSubtitle}>{subtitle}</p>}
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          style={{ position: "fixed", zIndex: 99999, top: 0, left: 0 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    );
  }

  return content;
};

LoadingScreen.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  variant: PropTypes.oneOf(["fullscreen", "inline"]),
  isVisible: PropTypes.bool,
};

export default LoadingScreen;
