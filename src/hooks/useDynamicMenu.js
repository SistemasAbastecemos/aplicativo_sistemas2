import { useState, useEffect, useCallback } from "react";
import { menuService } from "../services/menuService";
import { roleService } from "../services/roleService";
import { useAuth } from "../contexts/AuthContext";

export const useDynamicMenu = () => {
  const [menu, setMenu] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [acciones, setAcciones] = useState({
    accionesRapidas: [],
    funcionalidadesEspeciales: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  // Algoritmo de busqueda recursiva para estructuras de arbol
  const buscarNodoRecursivo = useCallback((nodos, campo, valor) => {
    if (!nodos || !Array.isArray(nodos)) return null;

    for (const nodo of nodos) {
      if (nodo[campo] === valor) {
        return nodo;
      }
      if (nodo.children && nodo.children.length > 0) {
        const encontrado = buscarNodoRecursivo(nodo.children, campo, valor);
        if (encontrado) return encontrado;
      }
    }
    return null;
  }, []);

  // Verifica el acceso general a una ruta especifica
  const tieneAccesoARuta = useCallback(
    (ruta) => {
      return buscarNodoRecursivo(menu, "ruta", ruta) !== null;
    },
    [menu, buscarNodoRecursivo],
  );

  /**
   * Retorna el objeto de permisos de una ruta basandose en el arbol cargado.
   * Si la ruta no existe, deniega todas las acciones por seguridad (Fail-Safe).
   */
  const obtenerPermisosPorRuta = useCallback(
    (ruta) => {
      const nodo = buscarNodoRecursivo(menu, "ruta", ruta);
      return (
        nodo?.permisos || {
          ver: false,
          crear: false,
          editar: false,
          eliminar: false,
        }
      );
    },
    [menu, buscarNodoRecursivo],
  );

  // Mantiene compatibilidad con llamadas por ID de menu utilizando busqueda recursiva
  const tienePermiso = useCallback(
    (idMenu, accion) => {
      const nodo = buscarNodoRecursivo(menu, "id_menu", idMenu);
      return nodo?.permisos?.[accion] === true;
    },
    [menu, buscarNodoRecursivo],
  );

  const cargarDatos = useCallback(
    async (silencioso = false) => {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      try {
        // En refrescos silenciosos (revalidacion en segundo plano) NO tocamos
        // el loading global para no parpadear la UI.
        if (!silencioso) setLoading(true);
        setError(null);

        const result = await menuService.getMenuPorUsuario(user.id);

        // Validacion flexible por si la respuesta del service mapea a 'data' o 'menu'
        const menuData = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.menu)
            ? result.menu
            : [];

        const userData = result.userInfo || {};

        setMenu(menuData);
        setUserInfo(userData);

        if (userData.id && userData.id_rol) {
          try {
            const accionesData = await roleService.getAccionesPorUsuario(
              userData.id,
              userData.id_rol,
              userData.id_cargo || null,
            );
            setAcciones(accionesData);
          } catch (roleError) {
            console.warn("Error cargando acciones:", roleError);
            setAcciones(roleService.getAccionesPorDefecto(userData.id_rol));
          }
        }
      } catch (err) {
        console.error("Error cargando datos de menu:", err);
        setError(err.message);
        setMenu([]);
        setUserInfo(null);
        setAcciones({ accionesRapidas: [], funcionalidadesEspeciales: [] });
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    cargarDatos(); // carga inicial (con loading visible)

    // Revalidacion periodica silenciosa: detecta cambios de permisos hechos
    // en BD durante la sesion (habilita la expulsion en vivo de modulos).
    if (!user || !user.id) return undefined;
    const intervalo = setInterval(() => {
      cargarDatos(true);
    }, 60000); // cada 60s

    return () => clearInterval(intervalo);
  }, [user, cargarDatos]);

  return {
    menu,
    userInfo,
    acciones,
    loading,
    error,
    tienePermiso,
    tieneAccesoARuta,
    obtenerPermisosPorRuta,
    recargar: cargarDatos,
  };
};
