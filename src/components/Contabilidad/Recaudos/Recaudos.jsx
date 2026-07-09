import React, { useCallback } from "react";
import styles from "./Recaudos.module.css";
import LoadingScreen from "../../UI/LoadingScreen";
import { useNotification } from "../../../contexts/NotificationContext";

// Hooks
import { useFiltrosRecaudos } from "./hooks/useFiltrosRecaudos";
import { useResultadosPipeline } from "./hooks/useResultadosPipeline";
import { useConsultaRecaudos } from "./hooks/useConsultaRecaudos";

// Components
import RecaudosHeader from "./components/RecaudosHeader";
import FiltrosPanel from "./components/FiltrosPanel";
import ResultadosContainer from "./components/ResultadosContainer";

/**
 * Orquestador del módulo Recaudos. Coordina:
 *  - Filtros del reporte (tipo búsqueda, fechas/lapso, transacción)
 *  - Consulta al backend con validación previa
 *  - Pipeline en memoria: búsqueda cliente + sort + paginación
 *  - Exportación a Excel corporativo con branding Belalcázar
 *
 * Los tres hooks encapsulan responsabilidades bien definidas:
 *  - `useFiltrosRecaudos`: estado del formulario + validación + payload
 *  - `useResultadosPipeline`: pipeline puro sobre los datos cargados
 *  - `useConsultaRecaudos`: dos operaciones async (consultar + exportar)
 */
const Recaudos = () => {
  const { addNotification } = useNotification();

  const pipeline = useResultadosPipeline();

  const filtros = useFiltrosRecaudos({
    addNotification,
    onResetResultados: pipeline.resetPipeline,
  });

  const { loading, mensajeCarga, consultar, exportarExcel } =
    useConsultaRecaudos({
      addNotification,
      onDatosCargados: pipeline.cargarResultados,
    });

  // ==================== Handlers ====================

  const handleConsultar = useCallback(() => {
    if (!filtros.validarFormulario()) return;
    consultar({ payload: filtros.construirPayload() });
  }, [filtros, consultar]);

  const handleExportar = useCallback(() => {
    // Se exportan los resultados YA procesados (con búsqueda y sort
    // aplicados), no la lista cruda del backend — preserva comportamiento
    // del legacy.
    exportarExcel({
      datos: pipeline.resultadosProcesados,
      filtros: filtros.filtrosParaExcel,
    });
  }, [exportarExcel, pipeline.resultadosProcesados, filtros.filtrosParaExcel]);

  // ==================== Render ====================

  if (loading) {
    return (
      <LoadingScreen
        isVisible={true}
        title={mensajeCarga}
        subtitle="Un momento por favor..."
        variant="fullscreen"
      />
    );
  }

  return (
    <div className={styles.container}>
      <RecaudosHeader />

      <main className={styles.content}>
        <FiltrosPanel
          filtros={filtros}
          hayResultados={pipeline.resultados.length > 0}
          onConsultar={handleConsultar}
          onExportar={handleExportar}
        />

        <ResultadosContainer
          hayResultados={pipeline.resultados.length > 0}
          resultadosProcesados={pipeline.resultadosProcesados}
          datosPaginados={pipeline.datosPaginados}
          terminoBusqueda={pipeline.terminoBusqueda}
          onBusquedaChange={pipeline.handleBusqueda}
          orden={pipeline.orden}
          onSolicitarOrden={pipeline.solicitarOrden}
          paginaActual={pipeline.paginaActual}
          totalPaginas={pipeline.totalPaginas}
          onCambioPagina={pipeline.setPaginaActual}
        />
      </main>
    </div>
  );
};

export default Recaudos;
