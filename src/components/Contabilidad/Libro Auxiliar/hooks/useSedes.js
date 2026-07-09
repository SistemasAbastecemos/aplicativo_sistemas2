import { useState, useEffect } from "react";
import { apiService } from "../../../../services/api";

/**
 * Carga el catálogo de sedes (centros de operación) al montar. Se usa una
 * sola vez y el resultado alimenta el select de sede en los filtros y la
 * resolución del nombre de sede en el Excel exportado.
 */
export function useSedes({ addNotification }) {
  const [sedes, setSedes] = useState([]);

  useEffect(() => {
    const cargarSedes = async () => {
      try {
        const response = await apiService.searchSedes();
        if (response.success) {
          setSedes(response.data);
        }
      } catch (error) {
        addNotification({
          message: "Fallo en la extracción de centros de operación",
          type: "error",
        });
      }
    };
    cargarSedes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { sedes };
}
