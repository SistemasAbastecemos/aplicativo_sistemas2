import { useState, useEffect, useCallback } from "react";
import { apiService } from "../../../../services/api";
import { CONFIG_INICIAL } from "../utils/constants";

/**
 * Carga la configuración inicial de restricciones desde el backend y
 * expone helpers para modificarla en memoria y guardarla.
 *
 * El backend acepta dos claves para la restricción de retefuente
 * (`restricciones_retefuente` o legacy `restricciones_generales`) — se
 * conserva ese fallback para no romper configuraciones antiguas.
 */
export function useConfigPlanos({ addNotification }) {
  const [config, setConfig] = useState(CONFIG_INICIAL);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const fetchConfiguracion = useCallback(async () => {
    setLoadingConfig(true);
    try {
      const responseData = await apiService.getConfigPlanos();
      const data = responseData || {};
      setConfig({
        carga_habilitada: data.carga_habilitada ?? false,
        restricciones_retefuente:
          data.restricciones_retefuente || data.restricciones_generales || [],
        restricciones_ica_yumbo: data.restricciones_ica_yumbo || [],
        restricciones_ica_palmira: data.restricciones_ica_palmira || [],
        restricciones_reteiva: data.restricciones_reteiva || [],
      });
    } catch (error) {
      addNotification({
        message: "Error al cargar la configuración inicial",
        type: "error",
      });
    } finally {
      setLoadingConfig(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchConfiguracion();
  }, [fetchConfiguracion]);

  const guardarConfig = useCallback(async () => {
    setGuardando(true);
    try {
      await apiService.updateConfigPlanos(config);
      addNotification({
        message: "Configuración aplicada en los portales externos.",
        type: "success",
      });
    } catch (error) {
      addNotification({
        message: "Error al guardar configuración",
        type: "error",
      });
    } finally {
      setGuardando(false);
    }
  }, [config, addNotification]);

  const toggleCarga = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      carga_habilitada: !prev.carga_habilitada,
    }));
  }, []);

  return {
    config,
    setConfig,
    loadingConfig,
    guardando,
    guardarConfig,
    toggleCarga,
  };
}
