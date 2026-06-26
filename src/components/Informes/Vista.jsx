import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExpand,
  faCompress,
  faSpinner,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Informes.module.css";

function Vista({ url, titulo, area, color, onBack }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={styles.informeView}>
      <div className={styles.viewHeader}>
        <button className={styles.backButton} onClick={onBack}>
          <FontAwesomeIcon icon={faArrowLeft} /> Salir
        </button>
        <div className={styles.viewTitle}>
          <h1>{titulo}</h1>
          <span className={styles.areaBadge} style={{ backgroundColor: color }}>
            {area}
          </span>
        </div>
      </div>

      <div className={styles.vistaContainer}>
        <div
          className={`${styles.vistaWrapper} ${isFullscreen ? styles.fullscreen : ""}`}
        >
          <div className={styles.vistaToolbar}>
            <span className={styles.toolbarText}>
              Motor de renderizado: Microsoft Power BI
            </span>
            <button
              className={styles.toolbarButton}
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
            </button>
          </div>

          <div className={styles.iframeContainer}>
            {isLoading && (
              <div className={styles.loadingOverlay}>
                <FontAwesomeIcon icon={faSpinner} className={styles.spinner} />
                <p>Estableciendo conexion segura...</p>
              </div>
            )}
            <iframe
              title={titulo}
              src={url}
              className={styles.powerbiIframe}
              onLoad={() => setIsLoading(false)}
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Vista;
