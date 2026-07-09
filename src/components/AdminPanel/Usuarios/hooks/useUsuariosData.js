import { useState, useEffect, useCallback } from "react";
import { apiService } from "../../../../services/api";

/**
 * Encapsula los datos del módulo de usuarios: catálogos de referencia
 * (roles, cargos, áreas, sedes), la carga paginada de usuarios y la búsqueda
 * con retardo. El parámetro `habilitado` (permiso de ver) controla la carga.
 */
export function useUsuariosData({ addNotification, habilitado }) {
  const [usuarios, setUsuarios] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Datos de referencia
  const [roles, setRoles] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [sedes, setSedes] = useState([]);

  const cargarDatosAdicionales = useCallback(async () => {
    try {
      const [rolesData, cargosData, areasData, sedesData] = await Promise.all([
        apiService.getRoles(),
        apiService.getCargos(),
        apiService.getAreas(),
        apiService.getSedes(),
      ]);
      setRoles(rolesData);
      setCargos(cargosData);
      setAreas(areasData);
      setSedes(sedesData);
    } catch (error) {
      console.error("Error cargando datos adicionales:", error);
      addNotification({
        message: "Error cargando datos adicionales",
        type: "error",
      });
    }
  }, [addNotification]);

  const cargarUsuarios = useCallback(
    async (page = 1, searchText = "") => {
      setCargando(true);
      try {
        const data = await apiService.getUsuarios(page, 15, searchText);
        setUsuarios(data.usuarios || []);
        setTotalPaginas(data.paginacion?.total_paginas || 1);
        setTotalUsuarios(data.paginacion?.total_usuarios || 0);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
        addNotification({ message: "Error cargando usuarios", type: "error" });
      } finally {
        setCargando(false);
      }
    },
    [addNotification],
  );

  // Carga inicial (catálogos + usuarios) cuando el usuario queda habilitado.
  useEffect(() => {
    if (habilitado) {
      cargarDatosAdicionales();
      cargarUsuarios(pagina, search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habilitado]);

  // Recarga al cambiar de página.
  useEffect(() => {
    if (habilitado) cargarUsuarios(pagina, search);
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
        cargarUsuarios(1, value);
      }, 500);
      setSearchTimeout(nuevoTimeout);
    },
    [searchTimeout, cargarUsuarios],
  );

  return {
    usuarios,
    roles,
    cargos,
    areas,
    sedes,
    pagina,
    setPagina,
    totalPaginas,
    totalUsuarios,
    cargando,
    search,
    cargarUsuarios,
    handleSearchChange,
  };
}
