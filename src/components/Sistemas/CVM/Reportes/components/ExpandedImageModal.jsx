import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import styles from "../Reportes.module.css";

/**
 * Modal que muestra una imagen a pantalla completa (con backdrop oscuro).
 * Click fuera de la imagen o en el botón cierra.
 */
const ExpandedImageModal = React.memo(({ imageUrl, onClose }) => (
  <div className={styles.expandedOverlay}>
    <div
      className={styles.expandedContent}
      onClick={(e) => e.stopPropagation()}
    >
      <button className={styles.expandedClose} onClick={onClose} type="button">
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <img src={imageUrl} alt="Imagen expandida" />
    </div>
  </div>
));

ExpandedImageModal.displayName = "ExpandedImageModal";

export default ExpandedImageModal;
