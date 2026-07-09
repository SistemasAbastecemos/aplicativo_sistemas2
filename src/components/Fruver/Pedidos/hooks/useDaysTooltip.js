import { useState, useCallback, useEffect, useRef } from "react";

/**
 * Gestiona qué fila tiene el tooltip de días expandido (solo una a la vez).
 * Escucha clicks fuera para cerrar el tooltip automáticamente.
 *
 * El identificador de cierre es un atributo `data-days-container` que el
 * componente de la fila pone en el elemento clickeable; cualquier click
 * fuera de un elemento con ese atributo cierra el tooltip.
 */
export function useDaysTooltip() {
  const [expandedId, setExpandedId] = useState(null);
  const containersRef = useRef([]);

  const toggle = useCallback((itemId) => {
    setExpandedId((prev) => (prev === itemId ? null : itemId));
  }, []);

  const close = useCallback(() => {
    setExpandedId(null);
  }, []);

  useEffect(() => {
    if (expandedId === null) return;

    const handleClickOutside = (event) => {
      // Cerrar si el click no fue dentro de ningún .daysContainer
      if (!event.target.closest("[data-days-container]")) {
        setExpandedId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [expandedId]);

  return { expandedId, toggle, close };
}
