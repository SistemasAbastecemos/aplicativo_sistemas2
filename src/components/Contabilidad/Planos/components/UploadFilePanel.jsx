import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faFileExcel,
  faTimes,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../PlanosContables.module.css";
import { formatearTamanoMB } from "../utils/helpers";

/**
 * Panel derecho de la sección de carga: selector de archivo con drop zone
 * visual, preview del archivo seleccionado (nombre, tamaño, botón limpiar)
 * y los botones de subir/cancelar.
 *
 * El botón "Subir" se habilita solo cuando hay archivo y tipo seleccionado
 * (la empresa siempre tiene valor por defecto).
 */
const UploadFilePanel = ({
  file,
  tipo,
  cargando,
  onFileChange,
  onClearFile,
  onSubir,
  onCancelar,
}) => {
  const puedeSubir = !!file && !!tipo && !cargando;

  return (
    <div className={styles.uploadInfo}>
      <h3>Seleccionar Archivo Plano</h3>

      <div className={styles.uploadControls}>
        <input
          type="file"
          onChange={onFileChange}
          className={styles.fileInput}
          id="fileInput"
        />
        <label htmlFor="fileInput" className={styles.fileInputLabel}>
          <FontAwesomeIcon icon={faUpload} />
          Seleccionar archivo
        </label>

        {file && (
          <div className={styles.fileInfo}>
            <div className={styles.fileDetails}>
              <FontAwesomeIcon
                icon={faFileExcel}
                className={styles.fileIcon}
              />
              <div className={styles.fileDetailsText}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>
                  {formatearTamanoMB(file.size)} MB
                </span>
              </div>
            </div>
            <button
              className={styles.clearFile}
              onClick={onClearFile}
              type="button"
              title="Quitar archivo"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}

        <div className={styles.actionButtons}>
          <button
            onClick={onSubir}
            disabled={!puedeSubir}
            className={`${styles.submitButton} ${!puedeSubir ? styles.disabled : ""}`}
            type="button"
          >
            <FontAwesomeIcon icon={faPaperPlane} />
            Subir archivo
          </button>
          {cargando && (
            <button
              onClick={onCancelar}
              className={styles.cancelButton}
              type="button"
            >
              <FontAwesomeIcon icon={faTimes} />
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadFilePanel;
