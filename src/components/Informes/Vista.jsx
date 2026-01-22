import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExpand,
  faCompress,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Informes.module.css";

const powerBIUrls = {
  pyg1: "https://app.powerbi.com/view?r=eyJrIjoiNDczZTEzMTktM2FiMS00Zjc2LWI0OTYtN2U2ZThkNTdiMWJlIiwidCI6IjhkNTMwOTY3LTk3ZTgtNDJiMS1iOWEwLWNiZGVjNjNkOGQwYiJ9",
  pyg2: "https://app.powerbi.com/view?r=eyJrIjoiMmRkN2FmZjktNDU3ZC00YTc5LWIxOTEtY2FlNjY1NzU1NjhlIiwidCI6IjhkNTMwOTY3LTk3ZTgtNDJiMS1iOWEwLWNiZGVjNjNkOGQwYiJ9",
  rotaciones:
    "https://app.powerbi.com/view?r=eyJrIjoiODliYWEyMmYtYzg0ZC00ODhmLTgyOTMtZTZjYWU4ZWUzMjNiIiwidCI6IjhkNTMwOTY3LTk3ZTgtNDJiMS1iOWEwLWNiZGVjNjNkOGQwYiJ9",
  "proveedores y acreedores":
    "https://app.powerbi.com/view?r=eyJrIjoiNzhiM2MzODUtMmM3Zi00ZDliLWFhZGYtZDdlMGFiMmM1YzlhIiwidCI6IjhkNTMwOTY3LTk3ZTgtNDJiMS1iOWEwLWNiZGVjNjNkOGQwYiJ9",
  "belalcazar bi":
    "https://app.powerbi.com/view?r=eyJrIjoiNTkxODFhZDEtYmM0Ni00MzA5LTkzMjEtZjA5Mzk5NjNhYzc2IiwidCI6IjhkNTMwOTY3LTk3ZTgtNDJiMS1iOWEwLWNiZGVjNjNkOGQwYiJ9",
  "venta x cliente":
    "https://app.powerbi.com/view?r=eyJrIjoiYzYyNzkwNGQtZmI1Yi00Yzg0LTk3NjUtMmMxOTIwNTkwYjZiIiwidCI6IjhkNTMwOTY3LTk3ZTgtNDJiMS1iOWEwLWNiZGVjNjNkOGQwYiJ9",
  "rotaciones y existencias":
    "https://app.powerbi.com/view?r=eyJrIjoiZmYwNDMxZmEtZjBjMi00MDNhLTg3OWMtNTEyNjU3YTUwZGUxIiwidCI6IjhkNTMwOTY3LTk3ZTgtNDJiMS1iOWEwLWNiZGVjNjNkOGQwYiJ9",
  "belalcazar bi - tobar":
    "https://app.powerbi.com/view?r=eyJrIjoiYjgwNDg5OWMtNGFmZC00NTY3LTg2MDQtNDg2NjViOTE3YmZmIiwidCI6IjhkNTMwOTY3LTk3ZTgtNDJiMS1iOWEwLWNiZGVjNjNkOGQwYiJ9",
  "tobar sanchez azul":
    "https://app.powerbi.com/view?r=eyJrIjoiNDllZTI5YzctNDhkNi00NjAyLWE3MGQtNGRiNDY4ZWVlNjI2IiwidCI6IjhkNTMwOTY3LTk3ZTgtNDJiMS1iOWEwLWNiZGVjNjNkOGQwYiJ9",
  "tobar sanchez roja":
    "https://app.powerbi.com/view?r=eyJrIjoiOTFjNWZmNWMtNDA0ZS00MmU3LWFkYmUtZWI2NTM1ODM1NmI0IiwidCI6IjhkNTMwOTY3LTk3ZTgtNDJiMS1iOWEwLWNiZGVjNjNkOGQwYiJ9",
  fruver:
    "https://app.powerbi.com/view?r=eyJrIjoiNzU5YzUyMzQtYjQwZS00YzJiLWI5YjgtMThkMjdhMGJkNGI0IiwidCI6IjhkNTMwOTY3LTk3ZTgtNDJiMS1iOWEwLWNiZGVjNjNkOGQwYiJ9",
  "movimiento pdv":
    "https://app.powerbi.com/view?r=eyJrIjoiZGRiZjAwMjQtYjk1OC00MGExLTlmNDgtMWMxODQyMDMyMWIyIiwidCI6IjhkNTMwOTY3LTk3ZTgtNDJiMS1iOWEwLWNiZGVjNjNkOGQwYiJ9",
  "rentabilidad fruver":
    "https://app.powerbi.com/view?r=eyJrIjoiMDg1MjE4ZGUtNTJjYy00OTI3LWExMWItMDFmNTkzOTQ1YThmIiwidCI6IjhkNTMwOTY3LTk3ZTgtNDJiMS1iOWEwLWNiZGVjNjNkOGQwYiJ9",
};

function Vista({ informe }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iframeSrc = powerBIUrls[informe] || "";

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div
      className={`${styles.vistaWrapper} ${
        isFullscreen ? styles.fullscreen : ""
      }`}
    >
      <div className={styles.vistaToolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.toolbarText}>Power BI Report</span>
        </div>
        <div className={styles.toolbarRight}>
          <button
            className={styles.toolbarButton}
            onClick={toggleFullscreen}
            title={
              isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
            }
          >
            <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
          </button>
        </div>
      </div>

      <div className={styles.iframeContainer}>
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <FontAwesomeIcon icon={faSpinner} className={styles.spinner} />
            <p>Cargando informe...</p>
          </div>
        )}

        {iframeSrc ? (
          <iframe
            title={`powerbi-${informe}`}
            src={iframeSrc}
            className={styles.powerbiIframe}
            onLoad={handleIframeLoad}
            allowFullScreen
            style={{ display: isLoading ? "none" : "block" }}
          />
        ) : (
          <div className={styles.errorContainer}>
            <h3>Informe no disponible</h3>
            <p>
              El informe solicitado no se encuentra disponible en este momento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Vista;
