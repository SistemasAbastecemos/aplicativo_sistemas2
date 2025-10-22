import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faExchangeAlt,
  faLineChart,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Modals.module.css";

const ImageModal = ({ isOpen, onClose, selectedImage }) => {
  if (!isOpen || !selectedImage) return null;

  return (
    <div
      className={`${styles.modalOverlay} ${isOpen ? styles.show : ""}`}
      onClick={onClose}
    >
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            <FontAwesomeIcon
              icon={
                selectedImage.type === "reverso" ? faExchangeAlt : faLineChart
              }
              className={styles.modalIcon}
            />
            {selectedImage.title}
          </h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            &times;
          </button>
        </div>
        <div className={styles.imageWrapper}>
          <img
            src={selectedImage.url}
            alt="Imagen ampliada"
            className={styles.modalImage}
          />
        </div>
        <div className={styles.modalFooter}>
          <button
            className={styles.downloadButton}
            onClick={() => {
              window.open(selectedImage.url, "_blank");
            }}
          >
            <FontAwesomeIcon icon={faDownload} /> Descargar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
