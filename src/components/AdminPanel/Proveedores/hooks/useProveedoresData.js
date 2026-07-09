import { useState, useCallback } from "react";
import { apiService } from "../../../../services/api";

export const useProveedoresData = (addNotification) => {
  const [proveedores, setProveedores] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalProveedores, setTotalProveedores] = useState(0);
  const [cargando, setCargando] = useState(false);

  const cargarProveedores = useCallback(
    async (page = 1, searchText = "") => {
      setCargando(true);
      try {
        // APLICADO TRIM: Si viene undefined/null se vuelve "" y se remueven espacios fantasmas
        const cleanSearchText = (searchText || "").trim();

        // Le pasamos el texto ya limpio al servicio de la API
        const data = await apiService.getProveedores(page, 12, cleanSearchText);

        if (data && data.proveedores) {
          setProveedores(data.proveedores || []);
          setTotalPaginas(data.paginacion?.total_paginas || 1);
          setTotalProveedores(data.paginacion?.total_proveedores || 0);
        } else {
          setProveedores([]);
          setTotalPaginas(1);
          setTotalProveedores(0);
        }
      } catch (error) {
        console.error("Error cargando proveedores:", error);
        addNotification({
          message: "Error al comunicarse con el repositorio de proveedores",
          type: "error",
        });
      } finally {
        setCargando(false);
      }
    },
    [addNotification],
  );

  return {
    proveedores,
    setProveedores,
    pagina,
    setPagina,
    totalPaginas,
    totalProveedores,
    cargando,
    cargarProveedores,
  };
};
