import { useState, useCallback } from "react";

/**
 * Gestiona el estado de los filtros del reporte y la validación previa
 * a la consulta.
 *
 * Filtros mutuamente excluyentes:
 *  - tipoFiltro="fecha" → usa fechaInicio + fechaFin
 *  - tipoFiltro="lapso" → usa lapso (mes/año)
 *
 * Al cambiar de tipoFiltro se dispara `onReset` para que el orquestador
 * limpie los resultados anteriores (comportamiento del legacy).
 */
export function useFiltrosRecaudos({ addNotification, onResetResultados }) {
  const [tipoFiltro, setTipoFiltroState] = useState("fecha");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [lapso, setLapso] = useState("");
  const [tipoTransaccion, setTipoTransaccion] = useState("Todos");

  const setTipoFiltro = useCallback(
    (nuevoTipo) => {
      setTipoFiltroState(nuevoTipo);
      if (onResetResultados) onResetResultados();
    },
    [onResetResultados],
  );

  /**
   * Valida el formulario según el tipo de filtro activo. Notifica al
   * usuario si hay errores y retorna false; retorna true si es válido.
   */
  const validarFormulario = useCallback(() => {
    if (tipoFiltro === "fecha") {
      if (!fechaInicio || !fechaFin) {
        addNotification({
          message: "Debe ingresar la fecha inicial y la fecha final.",
          type: "warning",
        });
        return false;
      }
      if (new Date(fechaFin) < new Date(fechaInicio)) {
        addNotification({
          message: "La fecha final no puede ser menor a la fecha inicial.",
          type: "warning",
        });
        return false;
      }
    } else if (tipoFiltro === "lapso") {
      if (!lapso) {
        addNotification({
          message: "Debe seleccionar un lapso válido.",
          type: "warning",
        });
        return false;
      }
    }
    return true;
  }, [tipoFiltro, fechaInicio, fechaFin, lapso, addNotification]);

  /**
   * Construye el payload en el formato que espera el backend, con nulls
   * en los campos que no aplican según el tipoFiltro.
   */
  const construirPayload = useCallback(
    () => ({
      tipoFiltro,
      fechaInicio: tipoFiltro === "fecha" ? fechaInicio : null,
      fechaFin: tipoFiltro === "fecha" ? fechaFin : null,
      lapso: tipoFiltro === "lapso" ? lapso : null,
      tipoTransaccion,
    }),
    [tipoFiltro, fechaInicio, fechaFin, lapso, tipoTransaccion],
  );

  /**
   * Filtros expandidos para el Excel (incluye siempre todos los campos,
   * usados como metadatos en el header del archivo generado).
   */
  const filtrosParaExcel = {
    tipoFiltro,
    fechaInicio,
    fechaFin,
    lapso,
    tipoTransaccion,
  };

  return {
    tipoFiltro,
    setTipoFiltro,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    lapso,
    setLapso,
    tipoTransaccion,
    setTipoTransaccion,
    validarFormulario,
    construirPayload,
    filtrosParaExcel,
  };
}
