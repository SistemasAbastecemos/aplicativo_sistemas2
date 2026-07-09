import React, { useState } from "react";
import styles from "./PlanosContables.module.css";
import LoadingScreen from "../../UI/LoadingScreen";
import { useAuth } from "../../../contexts/AuthContext";
import { useNotification } from "../../../contexts/NotificationContext";

// Hooks
import { useConfigPlanos } from "./hooks/useConfigPlanos";
import { useRestricciones } from "./hooks/useRestricciones";
import { useUploadPlano } from "./hooks/useUploadPlano";

// Components
import PlanosHeader from "./components/PlanosHeader";
import PlanosTabs from "./components/PlanosTabs";
import CargaTab from "./components/CargaTab";
import ConfiguracionTab from "./components/ConfiguracionTab";

// Utils
import { esAdmin } from "./utils/helpers";

/**
 * Orquestador del módulo Planos Contables. Gestiona:
 *  - Tab activa (carga vs configuración)
 *  - Fetch de configuración inicial y guardado
 *  - Restricciones anuales (retefuente, ICA Yumbo/Palmira) y bimestrales (IVA)
 *  - Subida chunked de archivos con progress y cancelación
 *  - Permisos de administrador (rol=admin o área=SISTEMAS)
 *
 * La lógica pesada está distribuida en tres hooks:
 *  - `useConfigPlanos`: fetch/save + toggle carga_habilitada
 *  - `useRestricciones`: add/remove sobre el objeto config
 *  - `useUploadPlano`: selector, subida, progress, cancel
 */
function PlanosContables() {
  const { user: currentUser } = useAuth();
  const { addNotification } = useNotification();
  const isAdmin = esAdmin(currentUser);

  const [activeTab, setActiveTab] = useState("carga");

  const configHook = useConfigPlanos({ addNotification });
  const restricciones = useRestricciones({
    config: configHook.config,
    setConfig: configHook.setConfig,
    addNotification,
  });
  const upload = useUploadPlano({ addNotification });

  if (configHook.loadingConfig) {
    return (
      <LoadingScreen
        isVisible={true}
        title="Cargando módulo contable"
        subtitle="Sincronizando políticas y restricciones..."
        variant="fullscreen"
      />
    );
  }

  if (upload.cargando) {
    return (
      <LoadingScreen
        isVisible={true}
        title="Subiendo archivo"
        subtitle={`Progreso: ${upload.progress}%`}
        variant="fullscreen"
      />
    );
  }

  return (
    <div className={styles.container}>
      <PlanosHeader />
      <PlanosTabs activeTab={activeTab} onChangeTab={setActiveTab} />

      <main className={styles.content}>
        {activeTab === "carga" && (
          <CargaTab
            upload={upload}
            cargaHabilitada={configHook.config.carga_habilitada}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === "configuracion" && (
          <ConfiguracionTab
            config={configHook.config}
            isAdmin={isAdmin}
            guardando={configHook.guardando}
            onToggleCarga={configHook.toggleCarga}
            onSaveConfig={configHook.guardarConfig}
            restricciones={restricciones}
          />
        )}
      </main>
    </div>
  );
}

export default PlanosContables;
