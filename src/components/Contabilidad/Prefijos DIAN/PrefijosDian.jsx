import React from "react";
import styles from "./PrefijosDian.module.css";
import LoadingScreen from "../../UI/LoadingScreen";
import { useNotification } from "../../../contexts/NotificationContext";
import { useAuth } from "../../../contexts/AuthContext";
import { usePrefijosDian } from "./hooks/usePrefijosDian";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCogs,
  faTable,
  faLock,
  faFileExcel,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

import PrefijosDianHeader from "./components/PrefijosDianHeader";
import FilterToolbar from "./components/FilterToolbar";
import { AlertasAuditoria } from "./components/AlertasAuditoria";
import PrefijosDianGrid from "./components/PrefijosDianGrid";
import { TabParametrizacion } from "./components/TabParametrizacion";

const AuditoriaDian = () => {
  const { addNotification } = useNotification();
  const { user } = useAuth();
  const loginUsuario = user?.login || "sistema";

  const model = usePrefijosDian(loginUsuario, addNotification);

  const formatMiles = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "0";
    return Math.round(num).toLocaleString("es-CO");
  };

  return (
    <div className={styles.auditoriaContainer}>
      <LoadingScreen
        isVisible={model.loading}
        title="Consultando información de Prefijos DIAN"
        subtitle="Ejecutando cruce transaccional en la red..."
      />

      <header className={styles.appHeader}>
        <div className={styles.appHeaderContent}>
          <PrefijosDianHeader />

          <div className={styles.segmentedControl}>
            <button
              className={`${styles.segmentBtn} ${model.activeTab === "auditoria" ? styles.segmentActive : ""}`}
              onClick={() => model.setActiveTab("auditoria")}
              type="button"
            >
              <FontAwesomeIcon icon={faTable} /> Consolidado Matricial
            </button>
            <button
              className={`${styles.segmentBtn} ${model.activeTab === "configuracion" ? styles.segmentActive : ""}`}
              onClick={() => model.setActiveTab("configuracion")}
              type="button"
            >
              <FontAwesomeIcon icon={faCogs} /> Parametrización
            </button>
          </div>
        </div>
      </header>
      <div className={styles.appBody}>
        {model.activeTab === "auditoria" ? (
          <>
            <FilterToolbar model={model} />

            {model.reporte.length > 0 && (
              <div className={styles.conciliacionCard}>
                <div className={styles.excelBranding}>
                  <FontAwesomeIcon
                    icon={faFileExcel}
                    className={styles.excelIcon}
                  />
                  <div>
                    <h4>Cruzar Información con Listado Oficial DIAN</h4>
                    <p>Indexación de archivos XML extendidos en memoria.</p>
                  </div>
                </div>

                <div className={styles.fileUploadWrapper}>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={model.procesarExcelDian}
                    id="excelFile"
                    className={styles.fileInput}
                  />
                  <label htmlFor="excelFile" className={styles.fileLabel}>
                    Seleccionar Archivo DIAN
                  </label>
                  {model.datosDian && (
                    <span className={styles.badgeSuccessFile}>
                      Listado DIAN Indexado
                    </span>
                  )}
                </div>

                {model.datosDian && (
                  <div className={styles.guardarConciliacionWrapper}>
                    <button
                      className={styles.btnGuardarConciliacion}
                      onClick={model.ejecutarGuardadoConciliacion}
                      disabled={
                        model.guardandoConciliacion ||
                        model.diasNuevosParaGuardar === 0
                      }
                    >
                      <FontAwesomeIcon
                        icon={model.guardandoConciliacion ? faLock : faSave}
                      />
                      {model.guardandoConciliacion
                        ? " Guardando..."
                        : ` Guardar Conciliación (${model.diasNuevosParaGuardar})`}
                    </button>
                    {Object.keys(model.diasConciliados).length > 0 && (
                      <span className={styles.badgeDiasCerrados}>
                        <FontAwesomeIcon icon={faLock} />{" "}
                        {Object.keys(model.diasConciliados).length} día(s) ya
                        conciliado(s).
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {model.error && (
              <div className={styles.errorBox}>{model.error}</div>
            )}

            <AlertasAuditoria
              alertasSiesaHuerfanos={model.alertasHuerfanasConsolidadas}
              documentosFaltantesDian={model.documentosFaltantesDian}
              datosDian={model.datosDian}
              formatMiles={formatMiles}
            />

            <PrefijosDianGrid model={model} formatMiles={formatMiles} />
          </>
        ) : (
          <TabParametrizacion
            configList={model.configListEdit}
            sedesAgrupadas={model.sedesAgrupadas}
            handleConfigChange={model.handleConfigChange}
            toggleEstadoActivo={model.toggleEstadoActivo}
            handleRemoveConfigRow={model.handleRemoveConfigRow}
            handleAddConfigRow={model.handleAddConfigRow}
            ejecutarGuardadoConfig={model.ejecutarGuardadoConfig}
            ultimoIndexCreado={model.ultimoIndexCreado}
            setUltimoIndexCreado={model.setUltimoIndexCreado}
          />
        )}
      </div>
    </div>
  );
};

export default AuditoriaDian;
