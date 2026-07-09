import { useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "../../../../services/api";

export const useAdministrarItems = (addNotification) => {
  const [items, setItems] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState(null);

  const searchTimeoutRef = useRef(null);

  const fetchItems = useCallback(
    async (paginaActual, busquedaTerm) => {
      setCargando(true);
      try {
        const response = await apiService.getItemsFruver(
          paginaActual,
          20,
          busquedaTerm?.trim() || "",
        );
        if (response && response.success) {
          setItems(response.data?.items || response.items || []);
          setTotalPaginas(
            response.data?.paginacion?.total_paginas ||
              response.totalPaginas ||
              1,
          );
        } else {
          addNotification({
            type: "error",
            message: response?.message || "No se pudieron recuperar los items.",
          });
        }
      } catch (err) {
        console.error("Error en fetchItems:", err);
        addNotification({
          type: "error",
          message: "Error de red al consultar el catalogo de items.",
        });
      } finally {
        setCargando(false);
      }
    },
    [addNotification],
  );

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      setPagina(1);
      fetchItems(1, search);
    }, 400);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [search, fetchItems]);

  const recargarCatalogo = useCallback(() => {
    fetchItems(pagina, search);
  }, [pagina, search, fetchItems]);

  const handlePageChange = useCallback(
    (nuevaPagina) => {
      setPagina(nuevaPagina);
      fetchItems(nuevaPagina, search);
    },
    [search, fetchItems],
  );

  const iniciarCreacion = useCallback(() => {
    setNewItem({
      descripcion: "",
      item: "",
      observaciones: "",
      dias_pedido: "",
      comprador: "",
      administrador: "0",
    });
    setEditItem(null);
    setIsModalOpen(true);
  }, []);

  const iniciarEdicion = useCallback((row) => {
    setEditItem({ ...row });
    setNewItem(null);
    setIsModalOpen(true);
  }, []);

  const cerrarModal = useCallback(() => {
    setIsModalOpen(false);
    setEditItem(null);
    setNewItem(null);
  }, []);

  const ejecutarGuardadoItem = useCallback(async () => {
    const itemActivo = editItem || newItem;
    if (
      !itemActivo ||
      !itemActivo.grid ||
      !itemActivo.descripcion?.trim() ||
      !itemActivo.item?.trim()
    ) {
      // Validacion de campos llave antes del I/O
    }

    if (
      !itemActivo ||
      !itemActivo.descripcion?.trim() ||
      !itemActivo.item?.trim()
    ) {
      addNotification({
        type: "warning",
        message: "Por favor complete los campos obligatorios.",
      });
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        descripcion: itemActivo.descripcion.trim(),
        item: itemActivo.item.trim(),
        observaciones: itemActivo.observaciones?.trim() || "",
        dias_pedido: itemActivo.dias_pedido || "",
        comprador: itemActivo.comprador?.trim() || "",
        administrador: String(itemActivo.administrador || "0"),
      };

      const response = editItem
        ? await apiService.updateItemFruver(itemActivo.item, payload)
        : await apiService.createItemFruver(payload);

      if (response && response.success) {
        addNotification({
          type: "success",
          message: editItem
            ? "Item actualizado con exito."
            : "Item creado con exito.",
        });
        cerrarModal();
        fetchItems(pagina, search);
      } else {
        addNotification({
          type: "error",
          message: response?.message || "Error procesando la solicitud.",
        });
      }
    } catch (err) {
      console.error("Error en guardarItem:", err);
      addNotification({
        type: "error",
        message: "Excepcion critica al conectar con el servidor.",
      });
    } finally {
      setGuardando(false);
    }
  }, [
    editItem,
    newItem,
    pagina,
    search,
    fetchItems,
    cerrarModal,
    addNotification,
  ]);

  return {
    items,
    pagina,
    totalPaginas,
    cargando,
    guardando,
    search,
    setSearch,
    isModalOpen,
    editItem,
    setEditItem,
    newItem,
    setNewItem,
    iniciarCreacion,
    iniciarEdicion,
    cerrarModal,
    ejecutarGuardadoItem,
    handlePageChange,
    recargarCatalogo,
  };
};
