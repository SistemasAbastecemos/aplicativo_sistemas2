import { useState, useMemo, useEffect, useCallback } from "react";
import { ITEMS_POR_PAGINA } from "../utils/constants";

/**
 * Pipeline en memoria: aplica filtros multi-select → sort → paginación.
 * Al cambiar filtros o sort, se resetea la página a 1.
 *
 * El sort es inteligente: si ambos valores son numéricos los compara como
 * `parseFloat`, sino como string lowercase. Nulls/undefined se tratan
 * como string vacío.
 */
export function useSortPaginacion({ datos, filtros, sortConfig }) {
  const [pagina, setPagina] = useState(1);

  const datosProcesados = useMemo(() => {
    if (!datos || datos.length === 0) return [];

    let resultados = datos.filter((el) => {
      const matchProveedor = filtros.proveedores.includes(
        String(el.proveedor ?? ""),
      );
      const matchLinea = filtros.lineas.includes(String(el.linea ?? ""));
      const matchItem = filtros.items.includes(String(el.item ?? ""));
      return matchProveedor && matchLinea && matchItem;
    });

    if (sortConfig.key !== null) {
      resultados.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (!isNaN(valA) && !isNaN(valB) && valA !== "" && valB !== "") {
          return sortConfig.direction === "asc"
            ? parseFloat(valA) - parseFloat(valB)
            : parseFloat(valB) - parseFloat(valA);
        }

        valA = String(valA ?? "").toLowerCase();
        valB = String(valB ?? "").toLowerCase();
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return resultados;
  }, [datos, filtros, sortConfig]);

  // Reset página cuando cambian filtros o sort
  useEffect(() => {
    setPagina(1);
  }, [filtros, sortConfig]);

  const totalPaginas = Math.ceil(datosProcesados.length / ITEMS_POR_PAGINA);
  const indexInicio = (pagina - 1) * ITEMS_POR_PAGINA;
  const fragmentoDatos = datosProcesados.slice(
    indexInicio,
    indexInicio + ITEMS_POR_PAGINA,
  );

  const cambiarPagina = useCallback(
    (nueva) => {
      setPagina(Math.max(1, Math.min(nueva, totalPaginas || 1)));
    },
    [totalPaginas],
  );

  return {
    datosProcesados,
    fragmentoDatos,
    pagina,
    totalPaginas,
    cambiarPagina,
  };
}
