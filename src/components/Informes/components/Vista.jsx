import styles from "../Informes.module.css";
import LoadingScreen from "../../UI/LoadingScreen";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExpand,
  faCompress,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

function Vista({ url, titulo, area, areaClass, onBack }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={styles.informeView}>
      <div className={styles.viewHeader}>
        <button className={styles.backButton} onClick={onBack}>
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </button>
        <div className={styles.viewTitleContainer}>
          <h1 className={styles.viewTitle}>{titulo}</h1>
          <span className={`${styles.areaBadge} ${areaClass}`}>{area}</span>
        </div>
      </div>

      <div className={styles.vistaContainer}>
        <div
          className={`${styles.vistaWrapper} ${isFullscreen ? styles.fullscreen : ""}`}
        >
          <div className={styles.vistaToolbar}>
            <span className={styles.toolbarText}>
              Entorno de ejecución: Microsoft Power BI Cloud
            </span>
            <button
              className={styles.toolbarButton}
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Restaurar" : "Pantalla completa"}
            >
              <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
            </button>
          </div>

          <div
            className={styles.iframeContainer}
            style={{ position: "relative" }}
          >
            {/* 
              MÁSCARA ABSOLUTA COSMÉTICA:
              Superpone el spinner de Apple sobre el canvas para tapar el logo nativo de Power BI
            */}
            {isLoading && (
              <div className={styles.loadingMask}>
                <LoadingScreen
                  isVisible={isLoading}
                  title="Estableciendo Conexión"
                  subtitle="Conectando de forma segura con el servidor de datos..."
                  variant="inline"
                />
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
