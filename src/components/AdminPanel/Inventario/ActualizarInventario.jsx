import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { usePermisos } from "../../../hooks/usePermission";
import { useNotification } from "../../../contexts/NotificationContext";
import { apiService } from "../../../services/api";
import LoadingScreen from "../../UI/LoadingScreen";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

import styles from "./ActualizarInventario.module.css";
import { CONFIG_INVENTARIO } from "./constants/inventarioLayout";

import InventarioHeader from "./components/InventarioHeader";
import InventarioSelector from "./components/InventarioSelector";
import InventarioUploadArea from "./components/InventarioUploadArea";
import InventarioCardsInfo from "./components/InventarioCardsInfo";

function ActualizarInventario() {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const { puedeVer, puedeEditar, loading: permisosLoading } = usePermisos();

  const [file, setFile] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [tipoInventario, setTipoInventario] = useState("cajas");

  useEffect(() => {
    if (!permisosLoading && !puedeVer) {
      addNotification({
        message: "Se revocaron tus permisos para este módulo.",
        type: "error",
      });
      navigate("/inicio", { replace: true });
    }
  }, [permisosLoading, puedeVer, navigate, addNotification]);

  const currentMeta = useMemo(
    () => CONFIG_INVENTARIO[tipoInventario],
    [tipoInventario],
  );

  const handleFileChange = useCallback((e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  }, []);

  const handleTipoChange = useCallback((e) => {
    setTipoInventario(e.target.value);
  }, []);

  const handleFileUpload = async () => {
    if (!file) {
      addNotification({
        message: "Por favor, selecciona un archivo primero.",
        type: "warning",
      });
      return;
    }
    if (!puedeEditar) {
      addNotification({
        message: "No tienes permiso para actualizar el inventario.",
        type: "error",
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
        message: `${currentMeta.nombre} actualizados con éxito.`,
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

  if (permisosLoading) {
    return <LoadingScreen message="Verificando directivas de seguridad..." />;
  }

  if (!puedeVer) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <div className={styles.errorContent}>
            <h2>Acceso Restringido</h2>
            <p>No tienes privilegios para acceder a la carga de inventarios.</p>
          </div>
        </div>
      </div>
    );
  }

  if (cargando) {
    return (
      <LoadingScreen
        message={`Actualizando repositorio de ${currentMeta.nombre}...`}
      />
    );
  }

  return (
    <div className={styles.container}>
      <InventarioHeader />

      <InventarioSelector
        tipoInventario={tipoInventario}
        onTipoChange={handleTipoChange}
      />

      <main className={styles.content}>
        <div className={styles.mainCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <div className={styles.titleIcon}>
                <FontAwesomeIcon icon={currentMeta.icono} />
              </div>
              <div>
                <h2>Actualizar {currentMeta.nombre}</h2>
                <p>{currentMeta.descripcion}</p>
              </div>
            </div>
          </div>

          <div className={styles.cardContent}>
            <InventarioUploadArea
              file={file}
              onFileChange={handleFileChange}
              onRemoveFile={() => setFile(null)}
              onUpload={handleFileUpload}
              puedeEditar={puedeEditar}
              tipoNombre={currentMeta.nombre}
            />
          </div>
        </div>

        <InventarioCardsInfo />
      </main>
    </div>
  );
}

export default ActualizarInventario;
