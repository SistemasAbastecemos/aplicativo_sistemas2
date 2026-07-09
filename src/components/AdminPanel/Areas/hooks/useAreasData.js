import { useState, useEffect, useMemo, useCallback } from "react";
import { apiService } from "../../../../services/api";

/**
 * Encapsula los datos del módulo de áreas: carga desde el servidor,
 * paginación, búsqueda con retardo (debounce) y filtrado local sobre lo ya
 * cargado. El parámetro `habilitado` (permiso de ver) controla la carga.
 */
export function useAreasData({ addNotification, habilitado }) {
  const [areas, setAreas] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalAreas, setTotalAreas] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  const searchTrimmed = useMemo(() => search.trim(), [search]);

  const areasFiltradas = useMemo(() => {
    if (!searchTrimmed) return areas;
    const texto = searchTrimmed.toLowerCase();
    return areas.filter((a) =>
      Object.values(a).some(
        (value) => value && value.toString().toLowerCase().includes(texto),
      ),
    );
  }, [areas, searchTrimmed]);

  // Carga las áreas tolerando distintas formas de respuesta del servidor.
  const cargarAreas = useCallback(
    async (page = 1, searchText = "") => {
      setCargando(true);
      try {
        const data = await apiService.getAreas(false, page, searchText);

        if (data.data && data.data.areas) {
          setAreas(data.data.areas || []);
          setTotalPaginas(data.data.paginacion?.total_paginas || 1);
          setTotalAreas(data.data.paginacion?.total_areas || 0);
        } else if (Array.isArray(data)) {
          setAreas(data);
          setTotalPaginas(1);
          setTotalAreas(data.length);
        } else if (data.areas) {
          setAreas(data.areas || []);
          setTotalPaginas(data.paginacion?.total_paginas || 1);
          setTotalAreas(data.paginacion?.total_areas || 0);
        } else {
          setAreas([]);
          setTotalPaginas(1);
          setTotalAreas(0);
        }
      } catch (error) {
        console.error("Error cargando áreas:", error);
        addNotification({ message: "Error cargando áreas", type: "error" });
      } finally {
        setCargando(false);
      }
    },
    [addNotification],
  );

  // Carga inicial cuando el usuario queda habilitado.
  useEffect(() => {
    if (habilitado) cargarAreas(pagina, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habilitado]);

  // Recarga al cambiar de página.
  useEffect(() => {
    if (habilitado) cargarAreas(pagina, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina]);

  // Limpia el temporizador de búsqueda al desmontar.
  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  // Búsqueda con retardo: reinicia a la página 1 y consulta al servidor.
  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearch(value);
      if (searchTimeout) clearTimeout(searchTimeout);
      const nuevoTimeout = setTimeout(() => {
        setPagina(1);
        cargarAreas(1, value.trim());
      }, 500);
      setSearchTimeout(nuevoTimeout);
    },
    [searchTimeout, cargarAreas],
  );

  return {
    areas,
    areasFiltradas,
    pagina,
    setPagina,
    totalPaginas,
    totalAreas,
    cargando,
    search,
    cargarAreas,
    handleSearchChange,
  };
}
