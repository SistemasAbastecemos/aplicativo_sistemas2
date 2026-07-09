import { useState, useMemo, useCallback } from "react";
import { apiService } from "../../../../../services/api";

/**
 * Encapsula el panel de acción del reporte: estado final, acción tomada y
 * envío al backend. La acción solo es enviable cuando:
 *  - el filtro actual es "No cumple" (los otros estados no requieren acción)
 *  - el estado final es "Bueno"
 *  - hay una acción escrita (con contenido real, no solo espacios)
 *  - hay un registro seleccionado
 *
 * `onEnviado` se dispara tras un envío exitoso para que el orquestador
 * refresque el listado.
 */
export function useAccionForm({ estado, addNotification, onEnviado }) {
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [accionTomada, setAccionTomada] = useState("");
  const [estadoFinal, setEstadoFinal] = useState("Bueno");

  const accionTrimmed = useMemo(() => accionTomada.trim(), [accionTomada]);

  const isEnviarDisabled = useMemo(
    () =>
      estadoFinal !== "Bueno" || accionTrimmed === "" || estado !== "No cumple",
    [estadoFinal, accionTrimmed, estado],
  );

  const handleAccionChange = useCallback((e) => {
    // Bloquea espacios al inicio en tiempo real; trim final al enviar.
    setAccionTomada(e.target.value.replace(/^\s+/, ""));
  }, []);

  const resetForm = useCallback(() => {
    setSelectedRegistro(null);
    setAccionTomada("");
    setEstadoFinal("Bueno");
  }, []);

  const handleEnviar = useCallback(async () => {
    if (isEnviarDisabled || !selectedRegistro) {
      addNotification({
        message:
          "Por favor, completa todos los campos requeridos antes de enviar.",
        type: "warning",
      });
      return;
    }

    try {
      const payload = {
        id_registro: selectedRegistro.id_registro,
        estado_final: estadoFinal,
        observaciones: accionTrimmed,
      };

      const response = await apiService.updateReporteCVM(payload);

      if (response.success) {
        addNotification({
          message: "Registro actualizado correctamente.",
          type: "success",
        });
        resetForm();
        if (onEnviado) await onEnviado();
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    } catch (error) {
      addNotification({
        message: "Error al actualizar el registro: " + (error.message || error),
        type: "error",
      });
    }
  }, [
    isEnviarDisabled,
    selectedRegistro,
    estadoFinal,
    accionTrimmed,
    addNotification,
    resetForm,
    onEnviado,
  ]);

  return {
    selectedRegistro,
    setSelectedRegistro,
    accionTomada,
    estadoFinal,
    setEstadoFinal,
    isEnviarDisabled,
    handleAccionChange,
    handleEnviar,
    resetForm,
  };
}
