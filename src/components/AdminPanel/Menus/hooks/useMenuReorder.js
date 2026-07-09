import { useState, useRef, useCallback } from "react";
import { apiService } from "../../../../services/api";

/**
 * Encapsula toda la lógica de arrastrar y soltar para reordenar los menús.
 * Mantiene una lista "en vivo" (liveMenus) mientras se arrastra y persiste
 * el nuevo orden en el servidor al soltar.
 */
export function useMenuReorder({
  menus,
  setMenus,
  cargarDatos,
  addNotification,
}) {
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [liveMenus, setLiveMenus] = useState([]);
  const originalOrderRef = useRef(null);

  const handleDragStart = useCallback(
    (e, id) => {
      e.dataTransfer.effectAllowed = "move";
      const sorted = [...menus].sort(
        (a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0),
      );
      originalOrderRef.current = sorted;
      setLiveMenus(sorted);
      setDraggingId(id);
      setDragOverId(id);
    },
    [menus],
  );

  const handleDragEnter = useCallback(
    (e, id) => {
      e.preventDefault();
      if (!draggingId || id === draggingId) return;

      setDragOverId(id);

      // Reordena la lista en vivo intercambiando el elemento arrastrado.
      setLiveMenus((prev) => {
        const next = [...prev];
        const fromIdx = next.findIndex((m) => m.id === draggingId);
        const toIdx = next.findIndex((m) => m.id === id);
        if (fromIdx === -1 || toIdx === -1) return prev;
        const [removed] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, removed);
        return next;
      });
    },
    [draggingId],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDragEnd = useCallback(
    async (e) => {
      if (!draggingId) return;

      const finalList = liveMenus.length
        ? liveMenus
        : (originalOrderRef.current ?? []);

      // Reasigna el 'orden' según la posición final.
      const listaActualizada = finalList.map((item, index) => ({
        ...item,
        orden: index + 1,
      }));

      // Solo se envían al servidor los elementos cuyo orden cambió.
      const payloadMasivo = listaActualizada
        .filter((item) => {
          const original = menus.find((m) => m.id === item.id);
          return original && original.orden !== item.orden;
        })
        .map((item) => ({ id: item.id, orden: item.orden }));

      setMenus(listaActualizada);
      setDraggingId(null);
      setDragOverId(null);
      setLiveMenus([]);
      originalOrderRef.current = null;

      if (payloadMasivo.length > 0) {
        try {
          await apiService.updateMenuBulkOrder(payloadMasivo);
          addNotification({
            message: "Estructura de navegación actualizada",
            type: "success",
          });
        } catch {
          addNotification({
            message:
              "Error de sincronización. Se restaurará la estructura anterior.",
            type: "error",
          });
          cargarDatos();
        }
      }
    },
    [draggingId, liveMenus, menus, setMenus, cargarDatos, addNotification],
  );

  // Limpia el resaltado al salir de la cuadrícula (no de una tarjeta interna).
  const handleDragLeaveGrid = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverId(null);
    }
  }, []);

  return {
    draggingId,
    dragOverId,
    liveMenus,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDragEnd,
    handleDragLeaveGrid,
  };
}
