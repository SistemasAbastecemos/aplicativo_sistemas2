import { useState, useCallback } from "react";
import { apiService } from "../../../../services/api";
import { exportarExcelRecaudos } from "../utils/excelExport";

/**
 * Coordina las dos operaciones asincrónicas del módulo:
 *  1. Consultar el backend con los filtros y cargar resultados al pipeline
 *  2. Exportar los datos ya procesados (con filtro de búsqueda y sort
 *     aplicados) a Excel corporativo
 *
 * Ambas operaciones bloquean la UI con LoadingScreen y muestran un mensaje
 * contextual mientras corren.
 */
export function useConsultaRecaudos({
  addNotification,
  onDatosCargados,
}) {
  const [loading, setLoading] = useState(false);
  const [mensajeCarga, setMensajeCarga] = useState(
    "Procesando consulta en base de datos...",
  );

  const consultar = useCallback(
    async ({ payload }) => {
      setMensajeCarga("Procesando consulta en base de datos...");
      setLoading(true);
      try {
        const response = await apiService.obtenerReporteRecaudos(payload);

        if (response.success) {
          onDatosCargados(response.data);

          if (response.data.length === 0) {
            addNotification({
              message:
                "No se encontraron registros para los criterios seleccionados.",
              type: "info",
            });
          }
        } else {
          addNotification({
            message: response.message || "Error al obtener los datos.",
            type: "error",
          });
        }
      } catch (error) {
        addNotification({
          message: error.message || "Error de conexión con el servidor.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [addNotification, onDatosCargados],
  );

  const exportarExcel = useCallback(
    async ({ datos, filtros }) => {
      if (datos.length === 0) {
        addNotification({
          message: "No hay datos para exportar.",
          type: "warning",
        });
        return;
      }

      setMensajeCarga("Generando archivo Excel corporativo...");
      setLoading(true);

      try {
        // Diferir ejecución síncrona de ExcelJS para que el LoadingScreen
        // tenga tiempo de renderizar antes del trabajo pesado.
        await new Promise((resolve) => setTimeout(resolve, 50));

        await exportarExcelRecaudos({ datos, filtros });

        addNotification({
          message: "Archivo Excel generado correctamente.",
          type: "success",
        });
      } catch (error) {
        addNotification({
          message: "Error al estructurar el archivo Excel.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [addNotification],
  );

  return {
    loading,
    mensajeCarga,
    consultar,
    exportarExcel,
  };
}
