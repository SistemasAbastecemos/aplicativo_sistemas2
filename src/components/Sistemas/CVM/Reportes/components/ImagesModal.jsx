import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import styles from "../Reportes.module.css";

/**
 * Modal que muestra hasta 3 imágenes del registro (conforme, regularización
 * y precintos). Filtra las que no tienen src, así que si el registro solo
 * tiene una imagen, solo se muestra esa. Click en una imagen la expande.
 */
const ImagesModal = React.memo(({ registro, onClose, onImageClick }) => {
  const images = [
    {
      src: registro.imagen_conforme,
      title: "Imagen Conforme",
      key: "conforme",
    },
    {
      src: registro.imagen_regularizacion,
      title: "Imagen Regularización",
      key: "regularizacion",
    },
    {
      src: registro.imagen_precintos,
      title: "Imagen Precinto",
      key: "precintos",
    },
  ].filter((img) => img.src);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Imágenes del Registro #{registro.id_registro}</h2>
          <button className={styles.modalClose} onClick={onClose} type="button">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.imagesGrid}>
          {images.map((image) => (
            <div key={image.key} className={styles.imageContainer}>
              <h4>{image.title}</h4>
              <img
                src={image.src}
                alt={image.title}
                onClick={() => onImageClick(image.src)}
                className={styles.modalImage}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

ImagesModal.displayName = "ImagesModal";

export default ImagesModal;
