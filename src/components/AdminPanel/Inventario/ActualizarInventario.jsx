import React, { useState, useEffect } from "react";
import styles from "./ActualizarInventario.module.css";
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
  faFilter,
  faBox,
  faWeightHanging,
  faArchive,
  faBarcode,
  faPrint,
  faDesktop,
  faWarehouse,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function ActualizarInventario() {
  const { user: currentUser } = useAuth();
  const { addNotification } = useNotification();
  const [file, setFile] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [tipoInventario, setTipoInventario] = useState("cajas");
  const [errorPermisos, setErrorPermisos] = useState("");

  const esAdministrador = currentUser && currentUser.id_rol === 1;

  useEffect(() => {
    if (!esAdministrador) {
      setErrorPermisos("No tienes permisos para acceder a esta sección");
    }
  }, [esAdministrador]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleTipoChange = (e) => {
    setTipoInventario(e.target.value);
  };

  const handleFileUpload = async () => {
    if (!file) {
      addNotification({
        message: "Por favor, selecciona un archivo primero.",
        type: "warning",
      });
      return;
    }

    setCargando(true);

    const formData = new FormData();
    formData.append("archivo_excel", file);
    formData.append("tipo_inventario", tipoInventario);

    try {
      await apiService.updateInventario(tipoInventario, formData);

      addNotification({
        message: `${getTipoNombre()} actualizados con éxito.`,
        type: "success",
      });
      setFile(null);
    } catch (error) {
      addNotification({
        message: error.message || "Error al actualizar los registros.",
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const getTipoNombre = () => {
    const nombres = {
      cajas: "Cajas",
      balanzas: "Balanzas POS",
      cajones: "Cajones POS",
      escaneres: "Escaneres POS",
      impresoras: "Impresoras POS",
      pcs: "PCs POS",
    };
    return nombres[tipoInventario];
  };

  const getDescripcion = () => {
    const descripciones = {
      cajas:
        "Carga un archivo Excel con la información de las cajas para actualizar o agregar los registros.",
      balanzas:
        "Carga un archivo Excel con la información de las balanzas POS para actualizar o agregar los registros.",
      cajones:
        "Carga un archivo Excel con la información de los cajones POS para actualizar o agregar los registros.",
      escaneres:
        "Carga un archivo Excel con la información de los escaneres POS para actualizar o agregar los registros.",
      impresoras:
        "Carga un archivo Excel con la información de las impresoras POS para actualizar o agregar los registros.",
      pcs: "Carga un archivo Excel con la información de los PCs POS para actualizar o agregar los registros.",
    };
    return descripciones[tipoInventario];
  };

  const getIcono = () => {
    const iconos = {
      cajas: faBox,
      balanzas: faWeightHanging,
      cajones: faArchive,
      escaneres: faBarcode,
      impresoras: faPrint,
      pcs: faDesktop,
    };
    return iconos[tipoInventario];
  };

  if (!esAdministrador) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <div className={styles.errorContent}>
            <h2>Acceso Restringido</h2>
            <p>{errorPermisos}</p>
          </div>
        </div>
      </div>
    );
  }

  if (cargando) {
    return <LoadingScreen message={`Actualizando ${getTipoNombre()}...`} />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Actualizar Inventario</h1>
          <p className={styles.subtitle}>
            Gestión y actualización del inventario de equipos POS
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
              Tipo de Inventario
            </label>
            <select
              value={tipoInventario}
              onChange={handleTipoChange}
              className={styles.filterSelect}
            >
              <option value="cajas">Cajas</option>
              <option value="balanzas">Balanzas POS</option>
              <option value="cajones">Cajones POS</option>
              <option value="escaneres">Escaneres POS</option>
              <option value="impresoras">Impresoras POS</option>
              <option value="pcs">PCs POS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className={styles.content}>
        <div className={styles.mainCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <div className={styles.titleIcon}>
                <FontAwesomeIcon icon={getIcono()} />
              </div>
              <div>
                <h2>Actualizar {getTipoNombre()}</h2>
                <p>{getDescripcion()}</p>
              </div>
            </div>
          </div>

          <div className={styles.cardContent}>
            <div className={styles.uploadArea}>
              <div className={styles.uploadIcon}>
                <FontAwesomeIcon icon={faCloudUploadAlt} />
              </div>

              <div className={styles.uploadInfo}>
                <h3>Seleccionar Archivo Excel</h3>
                <p>Formatos soportados: .xlsx, .xls</p>

                <div className={styles.uploadControls}>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
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
                        onClick={() => setFile(null)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleFileUpload}
                    disabled={!file}
                    className={`${styles.submitButton} ${
                      !file ? styles.disabled : ""
                    }`}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    {cargando ? "Subiendo..." : `Actualizar ${getTipoNombre()}`}
                  </button>
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
                Asegúrate de que el archivo Excel tenga las columnas correctas
                según el tipo de inventario seleccionado.
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
                la información antes de subir.
              </p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>
              <FontAwesomeIcon icon={faWarehouse} />
            </div>
            <div className={styles.infoContent}>
              <h4>Gestión Centralizada</h4>
              <p>
                Mantén tu inventario actualizado para un mejor control de los
                equipos POS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActualizarInventario;
