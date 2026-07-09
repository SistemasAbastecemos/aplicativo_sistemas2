import { useState, useEffect, useCallback } from "react";
import { apiService } from "../../../services/api";

export const useInformesData = (addNotification) => {
  const [informes, setInformes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const cargarInformes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getInformes();
      setInformes(res.data || []);
    } catch (error) {
      addNotification({
        message: "No fue posible procesar la información",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    cargarInformes();
  }, [cargarInformes]);

  return { informes, isLoading, cargarInformes };
};
