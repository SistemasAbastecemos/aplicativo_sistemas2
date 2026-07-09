import { useState, useMemo, useEffect, useCallback } from "react";
import { ITEMS_PER_PAGE } from "../utils/constants";

/**
 * Pipeline en memoria sobre los items cargados:
 *  - Búsqueda cliente (case-insensitive con trim aplicado) sobre item,
 *    descripcion y comprador
 *  - Paginación local de 15 por página
 *
 * Al cambiar la búsqueda o al recibir un nuevo dataset, la página se
 * resetea a 1 automáticamente.
 */
export function usePedidosFilter({ items }) {
  const [search, setSearch] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const searchTrimmed = useMemo(() => search.trim().toLowerCase(), [search]);

  const filteredItems = useMemo(() => {
    if (!searchTrimmed) return items;
    return items.filter(
      (item) =>
        item.item?.toLowerCase().includes(searchTrimmed) ||
        item.descripcion?.toLowerCase().includes(searchTrimmed) ||
        item.comprador?.toLowerCase().includes(searchTrimmed),
    );
  }, [items, searchTrimmed]);

  // Reset a página 1 cuando cambia la búsqueda o los items
  useEffect(() => {
    setPaginaActual(1);
  }, [searchTrimmed, items]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (paginaActual - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const handleSearchChange = useCallback((e) => {
    // Bloqueo de espacios al inicio en tiempo real
    setSearch(e.target.value.replace(/^\s+/, ""));
  }, []);

  return {
    search,
    handleSearchChange,
    filteredItems,
    currentItems,
    paginaActual,
    setPaginaActual,
    totalPages,
    startIndex,
  };
}
