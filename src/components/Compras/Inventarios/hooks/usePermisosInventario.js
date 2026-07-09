import { useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "../../../../services/api";

export const usePermisosInventario = (addNotification) => {
  const [matrix, setMatrix] = useState([]);
  const [sedesCatalog, setSedesCatalog] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addNotificationRef = useRef(addNotification);
  useEffect(() => {
    addNotificationRef.current = addNotification;
  }, [addNotification]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const cargarCatalogosBase = useCallback(async () => {
    try {
      const resSedes = await apiService.getSedes();
      setSedesCatalog(resSedes?.data || resSedes || []);
    } catch (err) {
      console.error("Error al cargar catálogo de sedes:", err);
    }
  }, []);

  const fetchMatrix = useCallback(async (textSearch) => {
    setLoading(true);
    try {
      const result = await apiService.getPermisosInventario(textSearch);
      setMatrix(result.rows || []);
    } catch (err) {
      addNotificationRef.current({
        message: "Fallo consultando la matriz unificada de privilegios",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarCatalogosBase();
  }, [cargarCatalogosBase]);

  useEffect(() => {
    fetchMatrix(debouncedSearch);
  }, [debouncedSearch, fetchMatrix]);

  const handleEliminarRegla = useCallback(
    async (row) => {
      if (
        !window.confirm(
          `¿Está seguro de revocar la regla para el proveedor ${row.nit_proveedor || row.nit}?`,
        )
      ) {
        return;
      }
      setLoading(true);
      try {
        await apiService.eliminarPermisoInventario(row.id);
        addNotificationRef.current({
          message: "Privilegios revocados exitosamente",
          type: "success",
        });
        await fetchMatrix(debouncedSearch);
      } catch (err) {
        addNotificationRef.current({
          message:
            err.message || "Fallo eliminando el registro de configuración",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, fetchMatrix],
  );

  const handleSavePermisos = useCallback(
    async (payload) => {
      setLoading(true);
      try {
        const res = await apiService.guardarPermisoInventario(payload);
        if (res.success) {
          addNotificationRef.current({
            message: modalData?.id
              ? "Parámetros de proveedor actualizados correctamente"
              : "Configuración de proveedor agregada con éxito",
            type: "success",
          });
          setIsModalOpen(false);
          await fetchMatrix(debouncedSearch);
          return true;
        }
        return false;
      } catch (err) {
        addNotificationRef.current({
          message: err.message || "Error al procesar la transacción",
          type: "error",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [modalData, debouncedSearch, fetchMatrix],
  );

  return {
    matrix,
    sedesCatalog,
    search,
    setSearch,
    loading,
    modalData,
    setModalData,
    isModalOpen,
    setIsModalOpen,
    handleEliminarRegla,
    handleSavePermisos,
    fetchMatrix,
  };
};
