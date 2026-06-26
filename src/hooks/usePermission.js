import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useMenu } from "../contexts/MenuContext";
import { useEmpresa } from "../contexts/EmpresaContext";
import { apiService } from "../services/api";

/**
 * usePermisos(rutaManual?, opciones?)
 * -----------------------------------
 * Hook unico de permisos. Devuelve, sobre un menu/ruta:
 *
 *   - permisos:   objeto granular { ver, crear, editar, eliminar } leido del
 *                 arbol cargado en MenuContext (sincrono, sin fetch).
 *   - puede*:     atajos booleanos (puedeVer, puedeCrear, puedeEditar, puedeEliminar).
 *   - hasAccess:  booleano de "puede entrar". Por defecto se deriva del arbol
 *                 (ver === true). Si se pide verificacion al servidor, refleja
 *                 la respuesta autoritativa de verifyMenuAccess.
 *   - loading / error / ruta.
 *
 * La ruta se resuelve sola con useLocation; el componente no necesita
 * hardcodearla. Se puede forzar otra ruta con `rutaManual`.
 *
 * @param {string|null} rutaManual          Consultar OTRA ruta distinta a la actual.
 * @param {{ verificarServidor?: boolean }} opciones
 *        verificarServidor=true  -> consulta apiService.verifyMenuAccess (depende de `empresa`).
 *                                   Util para guards de ruta que requieren la verdad del servidor.
 *        verificarServidor=false -> (por defecto) solo lee del arbol en memoria. Cero fetches.
 */
export const usePermisos = (rutaManual = null, opciones = {}) => {
  const { verificarServidor = false } = opciones;

  const location = useLocation();
  const { obtenerPermisosPorRuta, loading: menuLoading } = useMenu();
  const { empresa } = useEmpresa();

  const ruta = rutaManual || location.pathname;
  const permisos = obtenerPermisosPorRuta(ruta);

  const [hasAccessServidor, setHasAccessServidor] = useState(null);
  const [verificando, setVerificando] = useState(verificarServidor);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!verificarServidor) return undefined;

    let activo = true;

    const checkPermission = async () => {
      if (!ruta || !empresa) {
        if (activo) setVerificando(false);
        return;
      }

      try {
        setVerificando(true);
        const res = await apiService.verifyMenuAccess({ ruta, empresa });
        if (!activo) return;
        setHasAccessServidor(!!res.success);
        setError(res.success ? null : res.message);
      } catch (err) {
        if (!activo) return;
        setHasAccessServidor(false);
        setError(err.message);
      } finally {
        if (activo) setVerificando(false);
      }
    };

    checkPermission();

    return () => {
      activo = false;
    };
  }, [ruta, empresa, verificarServidor]);

  // hasAccess: servidor si se pidio verificacion; si no, derivado del arbol.
  const hasAccess = verificarServidor ? hasAccessServidor : !!permisos.ver;

  return {
    permisos,
    puedeVer: !!permisos.ver,
    puedeCrear: !!permisos.crear,
    puedeEditar: !!permisos.editar,
    puedeEliminar: !!permisos.eliminar,
    hasAccess,
    loading: verificarServidor ? menuLoading || verificando : menuLoading,
    error,
    ruta,
  };
};
