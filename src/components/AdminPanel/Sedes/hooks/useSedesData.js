import { useState, useEffect, useMemo, useCallback } from "react";
import { apiService } from "../../../../services/api";

/**
 * Encapsula los datos del módulo de sedes: carga desde el servidor,
 * paginación, búsqueda con retardo (debounce) y el filtrado local sobre lo
 * ya cargado. El parámetro `habilitado` (permiso de ver) controla cuándo se
 * dispara la carga.
 */
export function useSedesData({ addNotification, habilitado }) {
  const [sedes, setSedes] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalSedes, setTotalSedes] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  const searchTrimmed = useMemo(() => search.trim(), [search]);

  const sedesFiltradas = useMemo(() => {
    if (!searchTrimmed) return sedes;
    const texto = searchTrimmed.toLowerCase();
    return sedes.filter((s) =>
      Object.values(s).some(
        (value) => value && value.toString().toLowerCase().includes(texto),
      ),
    );
  }, [sedes, searchTrimmed]);

  // Carga las sedes tolerando distintas formas de respuesta del servidor.
  const cargarSedes = useCallback(
    async (page = 1, searchText = "") => {
      setCargando(true);
      try {
        const data = await apiService.getSedes(false, page, searchText);

        if (data.data && data.data.sedes) {
          setSedes(data.data.sedes || []);
          setTotalPaginas(data.data.paginacion?.total_paginas || 1);
          setTotalSedes(data.data.paginacion?.total_sedes || 0);
        } else if (Array.isArray(data)) {
          setSedes(data);
          setTotalPaginas(1);
          setTotalSedes(data.length);
        } else if (data.sedes) {
          setSedes(data.sedes || []);
          setTotalPaginas(data.paginacion?.total_paginas || 1);
          setTotalSedes(data.paginacion?.total_sedes || 0);
        } else {
          setSedes([]);
          setTotalPaginas(1);
          setTotalSedes(0);
        }
      } catch (error) {
        console.error("Error cargando sedes:", error);
        if (
          error.message.includes("permisos") ||
          error.message.includes("403")
        ) {
          addNotification({
            message: "No tienes privilegios para consultar sucursales",
            type: "error",
          });
        } else {
          addNotification({
            message: "Error en la comunicación con el servidor de datos",
            type: "error",
          });
        }
      } finally {
        setCargando(false);
      }
    },
    [addNotification],
  );

  // Carga inicial cuando el usuario queda habilitado.
  useEffect(() => {
    if (habilitado) cargarSedes(pagina, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habilitado]);

  // Recarga al cambiar de página.
  useEffect(() => {
    if (habilitado) cargarSedes(pagina, search);
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
        cargarSedes(1, value.trim());
      }, 500);
      setSearchTimeout(nuevoTimeout);
    },
    [searchTimeout, cargarSedes],
  );

  return {
    sedes,
    sedesFiltradas,
    pagina,
    setPagina,
    totalPaginas,
    totalSedes,
    cargando,
    search,
    cargarSedes,
    handleSearchChange,
  };
}
