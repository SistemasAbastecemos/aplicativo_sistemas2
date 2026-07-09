import { useState, useCallback, useEffect, useMemo } from "react";
import { apiService } from "../../../../../services/api";

/**
 * Encapsula el fetch, los filtros (estado, sede, búsqueda) y la paginación
 * del listado de reportes CVM.
 */
export function useReportesData(addNotification) {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [buscando, setBuscando] = useState(false); // Sincronizador de feedback visual de la lupa

  const [estado, setEstado] = useState("No cumple");
  const [sede, setSede] = useState("Todas");
  const [searchInput, setSearchInput] = useState("");
  const [searchTrimmed, setSearchTrimmed] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Control reactivo del indicador de búsqueda (Giro de Lupa)
  useEffect(() => {
    if (searchInput.trim() !== "") {
      setBuscando(true);
    }
    const handler = setTimeout(() => {
      setSearchTrimmed(searchInput.trim());
      setBuscando(false);
    }, 350);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const fetchRegistros = useCallback(async () => {
    setCargando(true);
    try {
      const response = await apiService.getReportesCVM(estado, sede, "");
      if (Array.isArray(response.data?.registros)) {
        setRegistros(response.data.registros);
      } else {
        setRegistros([]);
      }
    } catch (error) {
      addNotification({
        message: "Error cargando registros: " + (error.message || error),
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  }, [estado, sede, addNotification]);

  useEffect(() => {
    fetchRegistros();
  }, [fetchRegistros]);

  const hayBusqueda = useMemo(() => searchTrimmed !== "", [searchTrimmed]);

  const filteredRegistros = useMemo(() => {
    if (searchTrimmed === "") return registros;
    return registros.filter(
      (reg) =>
        reg.nombre_establecimiento
          ?.toLowerCase()
          .includes(searchTrimmed.toLowerCase()) ||
        reg.nit_establecimiento
          ?.toLowerCase()
          .includes(searchTrimmed.toLowerCase()) ||
        reg.id_registro?.toString().includes(searchTrimmed),
    );
  }, [registros, searchTrimmed]);

  // Bloque Memoizado de Paginación Exacta (Garantiza que no sea undefined)
  const paginationData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRegistros.slice(
      indexOfFirstItem,
      indexOfLastItem,
    );
    const totalPages = Math.ceil(filteredRegistros.length / itemsPerPage) || 1;

    return {
      currentItems,
      totalPages,
      hasItems: filteredRegistros.length > 0,
    };
  }, [filteredRegistros, currentPage, itemsPerPage]);

  const handleEstadoChange = useCallback((e) => {
    setEstado(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleSedeChange = useCallback((e) => {
    setSede(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleSearchInputChange = useCallback((e) => {
    setSearchInput(e.target.value.replace(/^\s+/, ""));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setEstado("No cumple");
    setSede("Todas");
    setSearchInput("");
    setCurrentPage(1);
  }, []);

  // Retorno explícito y tipado del contrato de datos del módulo
  return {
    registros,
    filteredRegistros,
    paginationData, // Inyección garantizada para Reportes.jsx
    cargando: cargando || buscando,
    estado,
    sede,
    searchInput,
    searchTrimmed,
    hayBusqueda,
    currentPage,
    setCurrentPage,
    handleEstadoChange,
    handleSedeChange,
    handleSearchInputChange,
    resetFilters,
    fetchRegistros,
  };
}
