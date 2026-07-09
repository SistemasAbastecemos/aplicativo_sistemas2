import { useState, useEffect, useCallback, useMemo } from "react";
import { apiService } from "../../../../services/api";

export const useParametrizacionCarnes = (addNotification) => {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "categoria",
    direction: "asc",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  const cargarCatalogoCompleto = useCallback(async () => {
    setCargando(true);
    try {
      const response = await apiService.getItemsCarnes();
      if (response && Array.isArray(response)) {
        setItems(response);
      } else {
        addNotification({
          message: "Formato de catálogo no reconocido.",
          type: "error",
        });
      }
    } catch (error) {
      console.error(error);
      addNotification({
        message: "Error al recuperar ítems para parametrización.",
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  }, [addNotification]);

  useEffect(() => {
    cargarCatalogoCompleto();
  }, [cargarCatalogoCompleto]);

  const ordenarPor = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const itemsOrdenados = useMemo(() => {
    const listado = [...items];
    if (!sortConfig.key) return listado;

    return listado.sort((a, b) => {
      const valA = String(a[sortConfig.key] || "")
        .trim()
        .toUpperCase();
      const valB = String(b[sortConfig.key] || "")
        .trim()
        .toUpperCase();
      return sortConfig.direction === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  }, [items, sortConfig]);

  const abrirCreacion = useCallback(() => {
    setActiveItem({
      id_item: "",
      descripcion: "",
      unidad_medida: "KG",
      categoria: "RES",
    });
    setIsModalOpen(true);
  }, []);

  const abrirEdicion = useCallback((item) => {
    setActiveItem({ ...item });
    setIsModalOpen(true);
  }, []);

  const cerrarModal = useCallback(() => {
    setIsModalOpen(false);
    setActiveItem(null);
  }, []);

  const persistirItem = useCallback(async () => {
    if (
      !activeItem?.id_item?.toString().trim() ||
      !activeItem?.descripcion?.trim()
    ) {
      addNotification({
        message: "Complete todos los campos obligatorios.",
        type: "warning",
      });
      return;
    }

    setGuardando(true);
    try {
      // Saneamiento estricto antes del envío por red (Trimming)
      const payload = {
        ...activeItem,
        id_item: activeItem.id_item.toString().trim(),
        descripcion: activeItem.descripcion.trim(),
        unidad_medida: activeItem.unidad_medida.trim(),
        categoria: activeItem.categoria.trim(),
      };

      const res = await apiService.saveItemCarnes(payload);
      if (res && res.success) {
        addNotification({
          message: res.message || "Cambios guardados con éxito.",
          type: "success",
        });
        cerrarModal();
        cargarCatalogoCompleto();
      }
    } catch (error) {
      addNotification({
        message: "No se pudo actualizar el ítem.",
        type: "error",
      });
    } finally {
      setGuardando(false);
    }
  }, [activeItem, cargarCatalogoCompleto, cerrarModal, addNotification]);

  return {
    items: itemsOrdenados,
    cargando,
    guardando,
    sortConfig,
    ordenarPor,
    isModalOpen,
    activeItem,
    setActiveItem,
    abrirCreacion,
    abrirEdicion,
    cerrarModal,
    persistirItem,
  };
};
