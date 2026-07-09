import React, { useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudUploadAlt,
  faUpload,
  faFileExcel,
  faTimes,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../ActualizarInventario.module.css";

const InventarioUploadArea = ({
  file,
  onFileChange,
  onRemoveFile,
  onUpload,
  puedeEditar,
  tipoNombre,
}) => {
  const [dragActive, setDragActive] = useState(false);

  // Maneja el evento cuando el archivo entra o se mueve sobre la zona de arrastre
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Procesa la suelta del archivo en la zona caliente
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const droppedFile = e.dataTransfer.files[0];

        // Validación defensiva de extensiones permitidas
        const nombreArchivo = droppedFile.name.toLowerCase();
        if (nombreArchivo.endsWith(".xlsx") || nombreArchivo.endsWith(".xls")) {
          // Mock funcional idéntico al target esperado por el evento onChange tradicional
          const pseudoEvent = { target: { files: [droppedFile] } };
          onFileChange(pseudoEvent);
        }
      }
    },
    [onFileChange],
  );

  const dropZoneClass = `${styles.uploadArea} ${dragActive ? styles.dragActive : ""}`;

  return (
    <div
      className={dropZoneClass}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <div className={styles.uploadIcon}>
        <FontAwesomeIcon icon={faCloudUploadAlt} />
      </div>

      <div className={styles.uploadInfo}>
        <h3>Arrastra y suelta tu archivo aquí</h3>
        <p>
          O si lo prefieres, utiliza el selector. Formatos soportados: .xlsx,
          .xls
        </p>

        <div className={styles.uploadControls}>
          <input
            type="file"
            accept=".xlsx, .xls"
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
                <div>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileSize}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <button
                className={styles.clearFile}
                onClick={onRemoveFile}
                type="button"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}

          <button
            onClick={onUpload}
            disabled={!file || !puedeEditar}
            className={`${styles.submitButton} ${!file || !puedeEditar ? styles.disabled : ""}`}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
            Actualizar {tipoNombre}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventarioUploadArea;
