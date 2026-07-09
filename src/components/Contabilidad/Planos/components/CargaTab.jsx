import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../PlanosContables.module.css";
import UploadFiltersPanel from "./UploadFiltersPanel";
import UploadFilePanel from "./UploadFilePanel";

/**
 * Tab "Carga de Archivos". Su comportamiento depende de dos flags:
 *  - `carga_habilitada`: toggle global del admin. Si está deshabilitado y
 *    el usuario NO es admin, se muestra el estado "suspendido".
 *  - `isAdmin`: si es admin, siempre puede operar; cuando la carga está
 *    deshabilitada pero es admin, ve un aviso naranja pero puede continuar.
 */
const CargaTab = ({ upload, cargaHabilitada, isAdmin }) => {
  if (!cargaHabilitada && !isAdmin) {
    return (
      <div className={styles.disabledState}>
        <FontAwesomeIcon icon={faBan} className={styles.disabledIcon} />
        <h3>Funcionalidad Suspendida</h3>
        <p>
          La carga manual de planos ha sido deshabilitada por el administrador.
        </p>
      </div>
    );
  }

  return (
    <>
      {!cargaHabilitada && isAdmin && (
        <div className={styles.warningBanner}>
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>
            El módulo de carga está desactivado, pero usted puede operar como
            administrador.
          </span>
        </div>
      )}

      <div className={styles.mainCard}>
        <div className={styles.cardContent}>
          <div className={styles.uploadArea}>
            <UploadFiltersPanel
              empresa={upload.empresa}
              onEmpresaChange={upload.handleEmpresaChange}
              tipo={upload.tipo}
              onTipoChange={upload.handleTipoChange}
            />

            <UploadFilePanel
              file={upload.file}
              tipo={upload.tipo}
              cargando={upload.cargando}
              onFileChange={upload.handleFileChange}
              onClearFile={upload.clearFile}
              onSubir={upload.subirArchivo}
              onCancelar={upload.cancelarSubida}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CargaTab;
