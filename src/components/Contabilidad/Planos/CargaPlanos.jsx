import React, { useState, useEffect } from "react";
import styles from "./CargaPlanos.module.css";
import { useAuth } from "../../../contexts/AuthContext";
import { useNotification } from "../../../contexts/NotificationContext";
import LoadingScreen from "../../UI/LoadingScreen";
import { apiService } from "../../../services/api";
import {
  faUpload,
  faFileExcel,
  faExclamationTriangle,
  faCheckCircle,
  faTimes,
  faPaperPlane,
  faCloudUploadAlt,
  faFileAlt,
  faBuilding,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function CargaPlanos() {
  const { user: currentUser } = useAuth();
  const { addNotification } = useNotification();

  const [file, setFile] = useState(null);
  const [empresa, setEmpresa] = useState("AB");
  const [tipo, setTipo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [progress, setProgress] = useState(0);
  const [controller, setController] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleEmpresaChange = (e) => setEmpresa(e.target.value);
  const handleTipoChange = (e) => setTipo(e.target.value);

  const handleFileUpload = async () => {
    if (!file)
      return addNotification({
        message: "Selecciona un archivo.",
        type: "warning",
      });
    if (!empresa || !tipo)
      return addNotification({
        message: "Selecciona empresa y tipo.",
        type: "warning",
      });

    setCargando(true);
    setProgress(0);

    const uploadId = `${file.name}_${Date.now()}`;
    const newController = new AbortController();
    setController(newController);

    try {
      await apiService.updatePlanosContabilidad({
        file,
        empresa,
        tipo,
        uploadId,
        onProgress: (percent) => setProgress(percent),
        signal: newController.signal,
      });
      addNotification({
        message: "Archivo plano subido exitosamente.",
        type: "success",
      });
    } catch (err) {
      if (err.name === "AbortError")
        addNotification({ message: "Subida cancelada.", type: "warning" });
      else
        addNotification({
          message: "Error al subir archivo plano.",
          type: "error",
        });
    } finally {
      setCargando(false);
      setProgress(0);
      setFile(null);
    }
  };

  const handleCancel = () => {
    if (controller) controller.abort();
  };

  const getTituloPlano = () => {
    const nombres = {
      CE: "Comprobantes de Egreso",
      N: "Notas N",
      NP: "Notas NP",
      NI: "Notas NI",
      CR: "Notas CR",
      NG: "Notas NG",
      Retefuente: "Retención en la fuente",
      ReteicaYumbo: "Rete ICA Yumbo",
      ReteicaPalmira: "Rete ICA Palmira",
      Reteiva: "Rete IVA",
    };
    return nombres[tipo] || "Archivos Planos";
  };

  const getIcono = () => {
    const iconos = {
      N: faFileExcel,
      CE: faFileAlt,
      NP: faFileExcel,
      NI: faFileExcel,
      CR: faFileExcel,
      NG: faFileExcel,
      Retefuente: faPaperPlane,
      ReteicaYumbo: faBuilding,
      ReteicaPalmira: faBuilding,
      Reteiva: faPaperPlane,
    };
    return iconos[tipo] || faFileAlt;
  };

  if (cargando)
    return <LoadingScreen message={`Subiendo archivo... ${progress}%`} />;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Carga de Planos Contables</h1>
          <p className={styles.subtitle}>
            Gestión y actualización de archivos planos del sistema contable
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <FontAwesomeIcon
                icon={faBuilding}
                className={styles.filterIcon}
              />
              Empresa
            </label>
            <select
              value={empresa}
              onChange={handleEmpresaChange}
              className={styles.filterSelect}
            >
              <option value="AB">Abastecemos de Occidente S.A.S</option>
              <option value="TS">Tobar Sanchez Valencia y Vallejo S.A</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
              Tipo de Archivo
            </label>
            <select
              value={tipo}
              onChange={handleTipoChange}
              className={styles.filterSelect}
            >
              <option value="">Seleccione un tipo</option>
              <option value="CE">Comprobantes de Egreso</option>
              <option value="N">Notas N</option>
              <option value="NP">Notas NP</option>
              <option value="NI">Notas NI</option>
              <option value="CR">Notas CR</option>
              <option value="NG">Notas NG</option>
              <option value="Retefuente">Retención en la fuente</option>
              <option value="ReteicaYumbo">Rete ICA Yumbo</option>
              <option value="ReteicaPalmira">Rete ICA Palmira</option>
              <option value="Reteiva">Rete IVA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className={styles.content}>
        <div className={styles.mainCard}>
          <div className={styles.cardContent}>
            <div className={styles.uploadArea}>
              <div className={styles.uploadIcon}>
                <FontAwesomeIcon icon={faCloudUploadAlt} />
              </div>

              <div className={styles.uploadInfo}>
                <h3>Seleccionar Archivo</h3>
                <p>Formatos soportados: .xlsx, .xls, .csv. .txt .TXT</p>

                <div className={styles.uploadControls}>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                    id="fileInput"
                    // accept=".xlsx,.xls,.csv,.txt,.TXT"
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
                        onClick={() => setFile(null)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  )}

                  <div className={styles.actionButtons}>
                    <button
                      onClick={handleFileUpload}
                      disabled={!file || !tipo}
                      className={`${styles.submitButton} ${
                        !file || !tipo ? styles.disabled : ""
                      }`}
                    >
                      <FontAwesomeIcon icon={faPaperPlane} />
                      {cargando
                        ? `Subiendo ${progress}%`
                        : `Subir ${getTituloPlano()}`}
                    </button>

                    {cargando && (
                      <button
                        onClick={handleCancel}
                        className={styles.cancelButton}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className={styles.infoCards}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <FontAwesomeIcon icon={faFileAlt} />
            </div>
            <div className={styles.infoContent}>
              <h4>Formato Requerido</h4>
              <p>
                Asegúrate de que el archivo tenga las columnas correctas según
                el tipo de plano contable.
              </p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>
            <div className={styles.infoContent}>
              <h4>Precaución</h4>
              <p>
                La actualización reemplazará los registros existentes. Verifica
                la información antes de proceder.
              </p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div className={styles.infoContent}>
              <h4>Proceso Seguro</h4>
              <p>
                Todos los archivos son validados antes de ser procesados en el
                sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CargaPlanos;
