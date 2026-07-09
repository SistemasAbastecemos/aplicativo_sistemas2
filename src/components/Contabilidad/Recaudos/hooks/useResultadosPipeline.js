import { useState, useMemo, useCallback } from "react";
import { ITEMS_POR_PAGINA } from "../utils/constants";

/**
 * Pipeline de procesamiento en memoria sobre los resultados del backend:
 *   resultados crudos → filtro por búsqueda → ordenación → paginación
 *
 * Preservado del legacy:
 *  - Búsqueda case-insensitive sobre todos los campos del objeto
 *  - Sort inteligente: si ambos valores son numéricos, compara como Number;
 *    sino como string. Nulls/undefined se tratan como string vacío.
 *  - Al cambiar búsqueda o sort, se resetea la página a 1.
 *
 * Trim aplicado: la búsqueda solo se dispara con contenido real (evita
 * disparar el filtro con strings de solo espacios).
 */
export function useResultadosPipeline() {
  const [resultados, setResultados] = useState([]);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [orden, setOrden] = useState({ columna: null, direccion: "asc" });
  const [paginaActual, setPaginaActual] = useState(1);

  // Trim aplicado al término de búsqueda antes del filtro
  const busquedaTrimmed = useMemo(
    () => terminoBusqueda.trim().toLowerCase(),
    [terminoBusqueda],
  );

  // ---------- Pipeline: filtrar → ordenar ----------
  const resultadosProcesados = useMemo(() => {
    let datos = [...resultados];

    if (busquedaTrimmed) {
      datos = datos.filter((item) =>
        Object.values(item).some(
          (val) =>
            val !== null &&
            val !== undefined &&
            val.toString().toLowerCase().includes(busquedaTrimmed),
        ),
      );
    }

    if (orden.columna) {
      datos.sort((a, b) => {
        let valA = a[orden.columna];
        let valB = b[orden.columna];

        if (valA === null || valA === undefined) valA = "";
        if (valB === null || valB === undefined) valB = "";

        // Sort numérico si ambos valores son parseables como número
        if (!isNaN(valA) && !isNaN(valB) && valA !== "" && valB !== "") {
          valA = Number(valA);
          valB = Number(valB);
        } else {
          valA = valA.toString().toLowerCase();
          valB = valB.toString().toLowerCase();
        }

        if (valA < valB) return orden.direccion === "asc" ? -1 : 1;
        if (valA > valB) return orden.direccion === "asc" ? 1 : -1;
        return 0;
      });
    }

    return datos;
  }, [resultados, busquedaTrimmed, orden]);

  // ---------- Paginación ----------
  const totalPaginas = Math.ceil(
    resultadosProcesados.length / ITEMS_POR_PAGINA,
  );

  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return resultadosProcesados.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [resultadosProcesados, paginaActual]);

  // ---------- Handlers ----------
  const handleBusqueda = useCallback((e) => {
    // Bloqueo de espacios al inicio en tiempo real
    setTerminoBusqueda(e.target.value.replace(/^\s+/, ""));
    setPaginaActual(1);
  }, []);

  const solicitarOrden = useCallback((columna) => {
    setOrden((prev) => {
      const direccion =
        prev.columna === columna && prev.direccion === "asc" ? "desc" : "asc";
      return { columna, direccion };
    });
    setPaginaActual(1);
  }, []);

  const resetPipeline = useCallback(() => {
    setResultados([]);
    setTerminoBusqueda("");
    setPaginaActual(1);
    setOrden({ columna: null, direccion: "asc" });
  }, []);

  const cargarResultados = useCallback((data) => {
    setResultados(data);
    setTerminoBusqueda("");
    setPaginaActual(1);
    setOrden({ columna: null, direccion: "asc" });
  }, []);

  return {
    resultados,
    resultadosProcesados,
    datosPaginados,
    totalPaginas,
    paginaActual,
    setPaginaActual,
    terminoBusqueda,
    handleBusqueda,
    orden,
    solicitarOrden,
    cargarResultados,
    resetPipeline,
  };
}
