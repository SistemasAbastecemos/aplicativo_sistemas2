import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";

import styles from "./ExistenciasAverias.module.css";
import LoadingScreen from "../../../UI/LoadingScreen";
import { useNotification } from "../../../../contexts/NotificationContext";
import { usePermisos } from "../../../../hooks/usePermission";

// Hooks
import { useConsultaExistencias } from "./hooks/useConsultaExistencias";

// Components
import EncabezadoSeccion from "./components/EncabezadoSeccion";
import TabsBar from "./components/TabsBar";
import FiltrosReporte from "./components/FiltrosReporte";
import TarjetasKpi from "./components/TarjetasKpi";
import TablaResultados from "./components/TablaResultados";
import TabParametrizacion from "./components/TabParametrizacion";

// Utils
import { exportarExcelCorporativo } from "./utils/excelExport";

const ExistenciasAverias = () => {
  const { addNotification } = useNotification();
  const {
    puedeVer,
    puedeCrear,
    puedeEditar,
    permisos,
    loading: permisosLoading,
  } = usePermisos();

  const [activeTab, setActiveTab] = useState("analitica");

  const { reporteData, loading, setLoading, ejecutarConsulta } =
    useConsultaExistencias({ addNotification });

  const handleExportarExcel = async () => {
    if (reporteData.length === 0) return;

    setLoading(true);
    try {
      await exportarExcelCorporativo({ reporteData });
      addNotification({
        type: "success",
        message: "Reporte corporativo generado con éxito",
      });
    } catch (error) {
      addNotification({
        type: "error",
        message: "Error al generar el archivo corporativo",
      });
    } finally {
      setLoading(false);
    }
  };

  if (permisosLoading) {
    return (
      <LoadingScreen
        isVisible={true}
        title="Cargando módulo"
        subtitle="Verificando permisos..."
        variant="fullscreen"
      />
    );
  }

  return (
    <div className={styles.moduloContainer}>
      {loading && (
        <LoadingScreen
          isVisible={true}
          title="Procesando"
          subtitle="Consultando datos..."
          variant="fullscreen"
        />
      )}

      <EncabezadoSeccion />

      <div className={styles.content}>
        {/* Pasamos los permisos puros para controlar el estado deshabilitado en la barra */}
        <TabsBar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          permisos={permisos}
        />

        {activeTab === "parametros" ? (
          <TabParametrizacion
            addNotification={addNotification}
            permisos={permisos}
          />
        ) : (
          <>
            <FiltrosReporte
              onBuscar={ejecutarConsulta}
              loading={loading}
              addNotification={addNotification}
            />

            {reporteData.length > 0 && (
              <>
                <TarjetasKpi datos={reporteData} />
                <div className={styles.contenedorAcciones}>
                  <button
                    className={styles.btnDescargarExcel}
                    onClick={handleExportarExcel}
                    type="button"
                  >
                    <FontAwesomeIcon
                      icon={faFileExcel}
                      className={styles.btnIconoMargen}
                    />
                    <span>Exportar Excel</span>
                  </button>
                </div>
              </>
            )}

            <TablaResultados
              datos={reporteData}
              key={`tabla-${reporteData.length}`}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ExistenciasAverias;
