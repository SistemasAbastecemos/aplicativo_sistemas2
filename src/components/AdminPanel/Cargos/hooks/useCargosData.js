import { useState, useCallback } from "react";
import { apiService } from "../../../../services/api";

export const useCargosData = (addNotification) => {
  const [cargos, setCargos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalCargos, setTotalCargos] = useState(0);
  const [cargando, setCargando] = useState(false);

  const cargarAreas = useCallback(async () => {
    try {
      const data = await apiService.getAreas(false);
      setAreas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando áreas:", err);
      addNotification({
        message: "Error cargando áreas corporativas",
        type: "error",
      });
    }
  }, [addNotification]);

  const cargarCargos = useCallback(
    async (page = 1, searchText = "") => {
      setCargando(true);
      try {
        const data = await apiService.getCargos(false, page, searchText);

        if (data.data && data.data.cargos) {
          setCargos(data.data.cargos || []);
          setTotalPaginas(data.data.paginacion?.total_paginas || 1);
          setTotalCargos(data.data.paginacion?.total_cargos || 0);
        } else if (Array.isArray(data)) {
          setCargos(data);
          setTotalPaginas(1);
          setTotalCargos(data.length);
        } else if (data.cargos) {
          setCargos(data.cargos || []);
          setTotalPaginas(data.paginacion?.total_paginas || 1);
          setTotalCargos(data.paginacion?.total_cargos || 0);
        } else {
          setCargos([]);
          setTotalPaginas(1);
          setTotalCargos(0);
        }
      } catch (error) {
        console.error("Error cargando cargos:", error);
        addNotification({
          message: "Error cargando registros de cargos",
          type: "error",
        });
      } finally {
        setCargando(false);
      }
    },
    [addNotification],
  );

  return {
    cargos,
    setCargos,
    areas,
    pagina,
    setPagina,
    totalPaginas,
    totalCargos,
    cargando,
    cargarAreas,
    cargarCargos,
  };
};
