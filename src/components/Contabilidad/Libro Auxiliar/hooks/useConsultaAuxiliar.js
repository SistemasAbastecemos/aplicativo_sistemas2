import { useState, useCallback } from "react";
import { apiService } from "../../../../services/api";
import {
  generarLapsosMensuales,
  ordenarRegistros,
} from "../utils/helpers";

/**
 * Encapsula la consulta del libro auxiliar. Divide el rango de fechas en
 * lapsos mensuales y hace una llamada al backend por cada mes (chunking),
 * acumulando resultados y mostrando progreso.
 *
 * Al terminar, ordena todo por tercero (asc) y fecha (desc).
 *
 * Estado expuesto:
 *  - `datos`: lista completa de registros (para preview y exportación)
 *  - `cargando`: mientras corre el chunking
 *  - `progresoCarga`: mensaje descriptivo del mes en curso
 */
export function useConsultaAuxiliar({ addNotification }) {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [progresoCarga, setProgresoCarga] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const consultar = useCallback(
    async (filtros) => {
      if (!filtros.fecha_inicio || !filtros.fecha_fin) {
        addNotification({
          message: "Defina un rango de fechas",
          type: "warning",
        });
        return;
      }

      setCargando(true);
      setDatos([]);
      setPaginaActual(1);

      const lapsos = generarLapsosMensuales(
        filtros.fecha_inicio,
        filtros.fecha_fin,
      );
      let acumulador = [];

      try {
        for (let i = 0; i < lapsos.length; i++) {
          const lapso = lapsos[i];
          setProgresoCarga(
            `Procesando periodo: ${lapso.etiqueta} (${i + 1} de ${lapsos.length})`,
          );

          const response = await apiService.obtenerDatosAuxiliar({
            ...filtros,
            fecha_inicio: lapso.inicio,
            fecha_fin: lapso.fin,
          });

          if (response.success && response.data) {
            acumulador = [...acumulador, ...response.data];
          }
        }

        if (acumulador.length > 0) {
          const ordenados = ordenarRegistros(acumulador);
          setDatos(ordenados);
          addNotification({
            message: `Carga completa: ${ordenados.length} registros extraídos.`,
            type: "success",
          });
        } else {
          addNotification({
            message: "No se encontraron datos",
            type: "warning",
          });
        }
      } catch (error) {
        addNotification({
          message: "Error en la concatenación: " + error.message,
          type: "error",
        });
      } finally {
        setCargando(false);
        setProgresoCarga("");
      }
    },
    [addNotification],
  );

  return {
    datos,
    cargando,
    setCargando,
    progresoCarga,
    setProgresoCarga,
    paginaActual,
    setPaginaActual,
    consultar,
  };
}
