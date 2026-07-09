import { useState, useCallback } from "react";
import { apiService } from "../../../../services/api";

/**
 * Encapsula la carga y el estado de los catálogos del módulo de menús
 * (menús, roles, áreas y cargos), la paginación y el indicador de carga.
 * No conoce nada de la UI: solo datos y operaciones de lectura.
 */
export function useMenusData(addNotification) {
  const [menus, setMenus] = useState([]);
  const [roles, setRoles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [cargos, setCargos] = useState([]);

  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalMenus, setTotalMenus] = useState(0);
  const [cargando, setCargando] = useState(false);

  // Carga todos los catálogos en paralelo y deja los menús ordenados por 'orden'.
  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [menusRes, rolesRes, areasRes, cargosRes] = await Promise.all([
        apiService.getMenus(),
        apiService.getRoles(),
        apiService.getAreas(),
        apiService.getCargos(),
      ]);

      const menusObtenidos = menusRes.data ?? menusRes;
      menusObtenidos.sort(
        (a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0),
      );

      setMenus(menusObtenidos);
      setRoles(rolesRes.data ?? rolesRes);
      setAreas(areasRes.data ?? areasRes);
      setCargos(cargosRes.data ?? cargosRes);
      setTotalPaginas(1);
      setTotalMenus(menusObtenidos.length ?? 0);
    } catch {
      addNotification({
        message: "Error en la comunicación con el servidor",
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  }, [addNotification]);

  // Garantiza que los catálogos estén cargados antes de abrir el modal.
  const asegurarCatalogos = useCallback(async () => {
    if (!roles.length || !areas.length || !cargos.length) await cargarDatos();
  }, [roles.length, areas.length, cargos.length, cargarDatos]);

  return {
    menus,
    setMenus,
    roles,
    areas,
    cargos,
    pagina,
    setPagina,
    totalPaginas,
    totalMenus,
    cargando,
    setCargando,
    cargarDatos,
    asegurarCatalogos,
  };
}
