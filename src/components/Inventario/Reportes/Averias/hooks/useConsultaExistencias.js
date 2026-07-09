import { useState, useCallback } from "react";
import { apiService } from "../../../../../services/api";

/**
 * Encapsula la consulta al backend con `obtenerExistenciasAverias`.
 * El backend puede devolver la respuesta directamente o dentro de un
 * envoltorio `resultado` — se maneja ambos casos.
 */
export function useConsultaExistencias({ addNotification }) {
  const [reporteData, setReporteData] = useState([]);
  const [filtrosActivos, setFiltrosActivos] = useState(null);
  const [loading, setLoading] = useState(false);

  const ejecutarConsulta = useCallback(
    async (sedesSeleccionadas, lapsosSeleccionados) => {
      setLoading(true);
      try {
        const response = await apiService.obtenerExistenciasAverias(
          sedesSeleccionadas,
          lapsosSeleccionados,
        );

        const apiData = response.resultado ? response.resultado : response;

        if (apiData.success) {
          setReporteData(apiData.data || []);
          setFiltrosActivos({
            sedes: sedesSeleccionadas,
            lapsos: lapsosSeleccionados,
          });
          addNotification({
            type: "success",
            message: `Consulta exitosa. Se recuperaron ${apiData.data.length} registros.`,
          });
        } else {
          throw new Error(
            apiData.message || "No se obtuvieron resultados del servidor.",
          );
        }
      } catch (error) {
        addNotification({
          type: "error",
          message:
            error.message || "Fallo al conectar con el túnel de Cloudflare.",
        });
        setReporteData([]);
      } finally {
        setLoading(false);
      }
    },
    [addNotification],
  );

  return {
    reporteData,
    filtrosActivos,
    loading,
    setLoading,
    ejecutarConsulta,
  };
}
