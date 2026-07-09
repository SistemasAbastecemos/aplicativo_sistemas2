import React from "react";
import styles from "./BodegasAlternas.module.css";
import LoadingScreen from "../../../UI/LoadingScreen";
import { useNotification } from "../../../../contexts/NotificationContext";
import { useBodegasAlternas } from "./hooks/useBodegasAlternas";
import { TABS_BODEGAS } from "./utils/constants";
import { usePermisos } from "../../../../hooks/usePermission";

import { FontAwesomeIcon as FA } from "@fortawesome/react-fontawesome";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";

// Componentes del Módulo Desacoplados
import BodegasAlternasHeader from "./components/BodegasAlternasHeader";
import TabsBar from "./components/TabsBar";
import BodegasAlternasToolbar from "./components/BodegasAlternasToolbar";
import TablaReporte from "./components/TablaReporte";
import TabParametrizacion from "./components/TabParametrizacion";

const BodegasAlternas = () => {
  const { addNotification } = useNotification();
  const model = useBodegasAlternas(addNotification);

  // Consumo nativo del hook corporativo para el control de la sesión
  const {
    puedeCrear,
    puedeEditar,
    permisos,
    loading: permisosLoading,
  } = usePermisos();

  // Determinamos si el usuario tiene privilegios mínimos de alteración sobre el maestro
  const tieneAccesoParametros = !!(
    puedeCrear ||
    puedeEditar ||
    permisos?.crear ||
    permisos?.editar ||
    permisos?.eliminar
  );

  if (permisosLoading) {
    return (
      <LoadingScreen
        isVisible={true}
        title="Cargando módulo"
        subtitle="Verificando privilegios corporativos..."
        variant="fullscreen"
      />
    );
  }

  return (
    <div className={styles.moduloContainer}>
      {model.loading && (
        <LoadingScreen
          isVisible={true}
          title="Procesando"
          subtitle="Consultando balances de inventario..."
          variant="fullscreen"
        />
      )}

      {/* Cabecera Corporativa Independiente */}
      <BodegasAlternasHeader />

      <div className={styles.content}>
        {/* Inyección del nuevo componente modular externo */}
        <TabsBar
          activeTab={model.activeTab}
          onChangeTab={model.setActiveTab}
          tieneAccesoParametros={tieneAccesoParametros}
        />

        {model.activeTab === TABS_BODEGAS.ANALITICA ? (
          <>
            <BodegasAlternasToolbar
              lapsoCalendario={model.lapsoCalendario}
              setLapsoCalendario={model.setLapsoCalendario}
              onConsultar={model.consultarReporte}
            />

            {model.reporteData.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <div className={styles.contenedorAcciones}>
                  <button
                    className={styles.btnDescargarExcel}
                    onClick={model.ejecutarExportacionExcel}
                    type="button"
                  >
                    <FA icon={faFileExcel} /> Exportar Excel
                  </button>
                </div>
                <TablaReporte
                  datos={model.reporteData}
                  estructuras={model.estructurasColumnas}
                />
              </div>
            )}
          </>
        ) : (
          <TabParametrizacion
            model={model}
            puedeCrear={puedeCrear || !!permisos?.crear}
            puedeEditar={puedeEditar || !!permisos?.editar}
            puedeEliminar={!!permisos?.eliminar}
          />
        )}
      </div>
    </div>
  );
};

export default BodegasAlternas;
