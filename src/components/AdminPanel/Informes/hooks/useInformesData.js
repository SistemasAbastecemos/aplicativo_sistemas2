import { useState, useCallback, useRef } from "react";
import { apiService } from "../../../../services/api";

export const useInformesData = (addNotification) => {
  const [informes, setInformes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ordenModificado, setOrdenModificado] = useState(false);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [draggingIndex, setDraggingIndex] = useState(null);

  const cargarCatalogos = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resInf, resAreas, resCargos] = await Promise.all([
        apiService.getInformes(),
        apiService.getAreas(),
        apiService.getCargos(),
      ]);

      setInformes(resInf?.data || resInf || []);
      setAreas(resAreas?.data || resAreas || []);
      setCargos(resCargos?.data || resCargos || []);
      setOrdenModificado(false);
    } catch (error) {
      console.error("Error al sincronizar catálogos:", error);
      addNotification({
        message: "Error al cargar la información base",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const handleDragStart = useCallback((index) => {
    dragItem.current = index;
    setDraggingIndex(index);
  }, []);

  const handleDragEnter = useCallback((index) => {
    const from = dragItem.current;
    if (from === null || from === index) return;

    // Actualizar refs/estado auxiliar ANTES del setState, fuera del updater
    dragItem.current = index;
    setDraggingIndex(index);

    setInformes((prev) => {
      // Updater puro: solo depende de `prev`, `from` e `index`
      if (from < 0 || from >= prev.length) return prev;
      const listaCopiada = [...prev];
      const [itemArrastrado] = listaCopiada.splice(from, 1);
      listaCopiada.splice(index, 0, itemArrastrado);
      return listaCopiada;
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    // Al soltar el click, asignamos el atributo jerárquico 'orden' de forma definitiva
    setInformes((prev) => {
      const updatedList = prev.map((item, idx) => ({
        ...item,
        orden: idx + 1,
      }));
      return updatedList;
    });

    setOrdenModificado(true); // Hace visible el botón de guardar

    // Limpieza de referencias
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingIndex(null);
  }, []);

  const guardarOrdenMasivo = useCallback(async () => {
    setIsLoading(true);
    const payload = informes.map((inf) => ({ id: inf.id, orden: inf.orden }));
    try {
      await apiService.updateInformeBulkOrder(payload);
      addNotification({
        message: "Orden de ejecución sincronizado",
        type: "success",
      });
      setOrdenModificado(false);
      await cargarCatalogos();
    } catch (error) {
      addNotification({
        message: error.message || "Error al sincronizar el orden jerárquico",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [informes, cargarCatalogos, addNotification]);

  return {
    informes,
    setInformes,
    areas,
    cargos,
    isLoading,
    ordenModificado,
    draggingIndex,
    cargarCatalogos,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
    guardarOrdenMasivo,
  };
};
