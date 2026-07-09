import { useState, useEffect } from "react";
import { apiService } from "../../../../../services/api";

/**
 * Carga los catálogos base del módulo CVM (cajas y supervisores de la sede
 * del usuario logueado). Se ejecuta una sola vez al montar y notifica el
 * bienvenida al cargar cajas correctamente (comportamiento legacy).
 */
export function useCatalogos({ sedeCodigo, addNotification }) {
  const [cajas, setCajas] = useState([]);
  const [supervisores, setSupervisores] = useState([]);

  useEffect(() => {
    if (!sedeCodigo) return;

    const fetchCajas = async () => {
      try {
        const response = await apiService.getCajas(sedeCodigo);
        setCajas(response);
        addNotification({
          message: "Bienvenido al aplicativo de supervisión.",
          type: "success",
        });
      } catch (error) {
        addNotification({
          message: "Error cargando las cajas: " + (error.message || error),
          type: "error",
        });
      }
    };

    fetchCajas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sedeCodigo]);

  useEffect(() => {
    if (!sedeCodigo) return;

    const fetchSupervisores = async () => {
      try {
        const response = await apiService.getSupervisores(sedeCodigo);
        setSupervisores(response);
      } catch (error) {
        addNotification({
          message:
            "Error cargando los supervisores: " + (error.message || error),
          type: "error",
        });
      }
    };

    fetchSupervisores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sedeCodigo]);

  return { cajas, supervisores };
}
