import React, { useMemo, useCallback } from "react";
import styles from "./LibroAuxiliar.module.css";
import LoadingScreen from "../../UI/LoadingScreen";
import { useNotification } from "../../../contexts/NotificationContext";

// Hooks
import { useSedes } from "./hooks/useSedes";
import { useFiltros } from "./hooks/useFiltros";
import { useConsultaAuxiliar } from "./hooks/useConsultaAuxiliar";

// Components
import LibroHeader from "./components/LibroHeader";
import FiltrosPanel from "./components/FiltrosPanel";
import AccionesBar from "./components/AccionesBar";
import PreviewTable from "./components/PreviewTable";

// Utils
import { exportarCSV } from "./utils/csvExport";
import { exportarExcelCorporativo } from "./utils/excelExport";
import { ITEMS_POR_PAGINA, LIMITE_REGISTROS_EXCEL } from "./utils/constants";

/**
 * Orquestador del módulo Libro Auxiliar. Coordina:
 *  - Filtros del reporte (empresa, sede, tercero, rango de fechas)
 *  - Consulta con chunking mensual (una llamada al API por mes)
 *  - Preview paginada de los resultados
 *  - Exportación a CSV (con BOM, separador `;`) o Excel corporativo
 *    (con logo, branding verde #009B6D, header combinado)
 *
 * La lógica pesada vive en tres hooks y dos utilidades de exportación.
 * Este componente solo compone y conecta.
 */
function LibroAuxiliar() {
  const { addNotification } = useNotification();

  const { sedes } = useSedes({ addNotification });
  const filtrosState = useFiltros({ addNotification });
  const consulta = useConsultaAuxiliar({ addNotification });

  // ==================== Cálculos derivados ====================

  const totalPaginas = Math.ceil(consulta.datos.length / ITEMS_POR_PAGINA);
  const itemsActuales = useMemo(
    () =>
      consulta.datos.slice(
        (consulta.paginaActual - 1) * ITEMS_POR_PAGINA,
        consulta.paginaActual * ITEMS_POR_PAGINA,
      ),
    [consulta.datos, consulta.paginaActual],
  );

  const totalGeneral = useMemo(
    () =>
      consulta.datos.reduce(
        (sum, row) => sum + parseFloat(row.valor_deb || 0),
        0,
      ),
    [consulta.datos],
  );

  const excelBloqueado = consulta.datos.length > LIMITE_REGISTROS_EXCEL;
  const hayDatos = consulta.datos.length > 0;

  // ==================== Handlers ====================

  const handleConsultar = useCallback(() => {
    consulta.consultar(filtrosState.filtros);
  }, [consulta, filtrosState.filtros]);

  const handleExportarCSV = useCallback(() => {
    if (!hayDatos) return;

    consulta.setCargando(true);
    consulta.setProgresoCarga("Generando archivo CSV...");

    // Timeout de 50ms para que el LoadingScreen tenga tiempo de renderizar
    // antes del trabajo síncrono del CSV (mismo truco del legacy)
    setTimeout(() => {
      try {
        exportarCSV({
          datos: consulta.datos,
          filtros: filtrosState.filtros,
        });
        addNotification({
          message: "CSV generado exitosamente",
          type: "success",
        });
      } catch (error) {
        addNotification({
          message: "Error al generar CSV",
          type: "error",
        });
      } finally {
        consulta.setCargando(false);
        consulta.setProgresoCarga("");
      }
    }, 50);
  }, [hayDatos, consulta, filtrosState.filtros, addNotification]);

  const handleExportarExcel = useCallback(async () => {
    if (!hayDatos) return;
    if (excelBloqueado) {
      addNotification({
        message: "Volumen de datos excede el límite de Excel. Use CSV.",
        type: "warning",
      });
      return;
    }

    consulta.setCargando(true);
    consulta.setProgresoCarga("Generando Excel corporativo...");

    try {
      await exportarExcelCorporativo({
        datos: consulta.datos,
        filtros: filtrosState.filtros,
        sedes,
      });
      addNotification({
        message: "Excel generado exitosamente",
        type: "success",
      });
    } catch (error) {
      addNotification({
        message: "Fallo en la generación Excel",
        type: "error",
      });
    } finally {
      consulta.setCargando(false);
      consulta.setProgresoCarga("");
    }
  }, [
    hayDatos,
    excelBloqueado,
    consulta,
    filtrosState.filtros,
    sedes,
    addNotification,
  ]);

  // ==================== Render ====================

  if (consulta.cargando) {
    return (
      <LoadingScreen
        isVisible={true}
        title={consulta.progresoCarga || "Extrayendo datos"}
        subtitle="Consolidando movimientos contables..."
        variant="fullscreen"
      />
    );
  }

  return (
    <div className={styles.container}>
      <LibroHeader totalGeneral={totalGeneral} hayDatos={hayDatos} />

      <main className={styles.content}>
        <div className={styles.formCard}>
          <FiltrosPanel
            filtros={filtrosState.filtros}
            sedes={sedes}
            proveedoresOptions={filtrosState.proveedoresOptions}
            buscandoProveedor={filtrosState.buscandoProveedor}
            onFilterChange={filtrosState.handleFilterChange}
            onProveedorSearch={filtrosState.handleProveedorSearch}
            onSelectProveedor={filtrosState.selectProveedor}
            onCerrarOpciones={filtrosState.cerrarOpciones}
          />

          <AccionesBar
            hayDatos={hayDatos}
            excelBloqueado={excelBloqueado}
            onConsultar={handleConsultar}
            onExportarCSV={handleExportarCSV}
            onExportarExcel={handleExportarExcel}
          />
        </div>

        {hayDatos && (
          <PreviewTable
            items={itemsActuales}
            paginaActual={consulta.paginaActual}
            totalPaginas={totalPaginas}
            onPageChange={consulta.setPaginaActual}
          />
        )}
      </main>
    </div>
  );
}

export default LibroAuxiliar;
