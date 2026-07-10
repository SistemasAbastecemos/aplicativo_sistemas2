import React, { useEffect } from "react";
import styles from "./PrintCanvas.module.css";
import { useNotification } from "../../contexts/NotificationContext";
import { usePermisos } from "../../hooks/usePermission";
import { usePrintCanvas } from "./hooks/usePrintCanvas";
import { faLock } from "@fortawesome/free-solid-svg-icons";

import LoadingScreen from "../UI/LoadingScreen";
import EmptyState from "../UI/EmptyState";
import StatusBar from "./components/StatusBar";
import PrintHeader from "./components/PrintHeader";
import TemplateManager from "./components/TemplateManager";
import PrintOutputSettings from "./components/PrintOutputSettings";
import RollPreviewMonitor from "./components/RollPreviewMonitor";

const PrintCanvas = () => {
  const { addNotification } = useNotification();
  const model = usePrintCanvas(addNotification);
  const {
    puedeVer,
    puedeCrear,
    puedeEditar,
    loading: permisosLoading,
  } = usePermisos();

  const tieneAccesoGestion = puedeCrear || puedeEditar;

  // Encontrar la plantilla activa en tiempo real según el ID seleccionado
  const activeTemplate = model.templates.find(
    (t) => String(t.id) === String(model.selectedTemplateId),
  );

  // ==========================================================================
  // Sincronización Automática al Cambiar de Módulo/Pestaña
  // ==========================================================================
  useEffect(() => {
    // Si el usuario regresa a la Terminal de Impresión, refrescamos el catálogo desde la API
    if (
      model.activeTab === "PRINT" &&
      typeof model.cargarPlantillas === "function"
    ) {
      model.cargarPlantillas();
    }
  }, [model.activeTab]); // Escucha activa del switch del TabBar

  if (permisosLoading) {
    return (
      <LoadingScreen
        isVisible={true}
        title="Validando Credenciales"
        subtitle="Verificando permisos en pasarela corporativa..."
        variant="fullscreen"
      />
    );
  }

  if (!puedeVer) {
    return (
      <div className={styles.moduloContainerApple}>
        <div className={styles.contentWrapperApple}>
          <EmptyState
            icon={faLock}
            title="Acceso Restringido"
            description="No cuenta con los privilegios requeridos para ver el módulo de impresión."
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.moduloContainerApple}>
      <StatusBar
        socketConnected={model.socketConnected}
        printerName={model.printerName}
      />

      <PrintHeader
        activeTab={model.activeTab}
        setActiveTab={model.setActiveTab}
        tieneAccesoGestion={tieneAccesoGestion}
      />

      <div className={styles.contentWrapperApple}>
        {model.activeTab === "PRINT" ? (
          <div className={styles.dashboardGridApple}>
            <div className={styles.leftPanelControl}>
              <PrintOutputSettings model={model} templates={model.templates} />
            </div>
            <div className={styles.rightPanelPreview}>
              <RollPreviewMonitor
                activeTemplate={activeTemplate}
                itemsToPrint={model.itemsToPrint}
              />
            </div>
          </div>
        ) : (
          tieneAccesoGestion && <TemplateManager />
        )}
      </div>
    </div>
  );
};

export default PrintCanvas;
