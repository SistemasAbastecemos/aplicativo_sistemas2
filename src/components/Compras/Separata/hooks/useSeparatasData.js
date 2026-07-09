import { useState, useCallback, useEffect, useRef } from "react";
import { apiService } from "../../../../services/api";

/**
 * Encapsula toda la interacción con el backend para separatas: carga de
 * separatas y de sus items, verificación de separata existente por rango de
 * fechas, y polling cada 5 segundos para detectar cambios de otros usuarios.
 *
 * Devuelve estado + acciones. No conoce nada de la UI.
 */
export function useSeparatasData(addNotification) {
  const [separatas, setSeparatas] = useState([]);
  const [separataItems, setSeparataItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const pollingIntervalRef = useRef(null);

  const fetchSeparatas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getSeparatas();
      setSeparatas(response.data);
      return response.data;
    } catch (error) {
      addNotification({
        message: "Error cargando separatas: " + (error.message || error),
        type: "error",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const fetchSeparataItems = useCallback(
    async (separataId) => {
      setLoading(true);
      try {
        const response = await apiService.getSeparataItems(separataId);
        setSeparataItems(response.data);
      } catch (error) {
        addNotification({
          message: "Error cargando items: " + (error.message || error),
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [addNotification],
  );

  const checkExistingSeparata = useCallback(
    async (fechaInicio, fechaFinal, currentSeparata, onFound) => {
      if (!fechaInicio || !fechaFinal || currentSeparata) return;
      try {
        const response = await apiService.checkSeparata(fechaInicio, fechaFinal);
        if (response.data.exists && response.data.id) {
          let separataCompleta = separatas.find(
            (s) => s.id === response.data.id,
          );

          if (!separataCompleta) {
            const separatasActualizadas = await fetchSeparatas();
            separataCompleta = separatasActualizadas.find(
              (s) => s.id === response.data.id,
            );
          }

          if (separataCompleta && onFound) {
            addNotification({
              message: "Separata existente encontrada, cargando...",
              type: "info",
            });
            onFound(separataCompleta);
          }
        }
      } catch (error) {
        console.error("Error verificando separata:", error);
      }
    },
    [separatas, fetchSeparatas, addNotification],
  );

  // Polling cada 5s: compara timestamps del servidor con el último visto y
  // recarga si hay cambios. Recibe callbacks para no depender de la UI.
  const startPolling = useCallback(
    ({ currentSeparata, onDataChanged }) => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      const checkLastUpdate = async () => {
        try {
          const response = await apiService.getLastUpdate();
          const serverTimestamp = response.data.timestamp;

          if (!lastUpdate) {
            setLastUpdate(serverTimestamp);
            return;
          }

          if (serverTimestamp > lastUpdate) {
            setLastUpdate(serverTimestamp);

            if (currentSeparata) {
              await fetchSeparataItems(currentSeparata.id);
              await fetchSeparatas();
            } else {
              await fetchSeparatas();
            }

            addNotification({
              message: "Datos actualizados",
              type: "info",
            });

            if (onDataChanged) onDataChanged();
          }
        } catch (error) {
          console.error("Error verificando actualizaciones:", error);
        }
      };

      pollingIntervalRef.current = setInterval(checkLastUpdate, 5000);
    },
    [lastUpdate, fetchSeparataItems, fetchSeparatas, addNotification],
  );

  // Cleanup del polling al desmontar.
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return {
    separatas,
    separataItems,
    setSeparataItems,
    loading,
    setLoading,
    fetchSeparatas,
    fetchSeparataItems,
    checkExistingSeparata,
    startPolling,
  };
}
