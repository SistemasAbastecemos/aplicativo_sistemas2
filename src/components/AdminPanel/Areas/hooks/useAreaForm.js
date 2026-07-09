import { useState, useMemo, useCallback } from "react";
import { apiService } from "../../../../services/api";

const FORM_VACIO = { nombre: "", descripcion: "", activo: 1 };

/**
 * Encapsula el estado y las operaciones del modal de área: datos del
 * formulario, apertura en modo nuevo/edición y guardado. Tras guardar,
 * invoca `recargar` para refrescar el listado.
 */
export function useAreaForm({ recargar, addNotification }) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [areaActual, setAreaActual] = useState(null);
  const [formData, setFormData] = useState(FORM_VACIO);

  const camposIncompletos = useMemo(
    () => !formData.nombre.trim() || !formData.descripcion.trim(),
    [formData.nombre, formData.descripcion],
  );

  const abrirModalNueva = useCallback(() => {
    setModoEdicion(false);
    setAreaActual(null);
    setFormData(FORM_VACIO);
    setMostrarModal(true);
  }, []);

  const abrirModalEditar = useCallback((area) => {
    setModoEdicion(true);
    setAreaActual(area);
    setFormData({
      nombre: area.nombre ?? "",
      descripcion: area.descripcion ?? "",
      activo: Number(area.activo ?? 1),
      id: area.id,
    });
    setMostrarModal(true);
  }, []);

  const cerrarModal = useCallback(() => setMostrarModal(false), []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    let cleanValue = value;
    if (name === "nombre" || name === "descripcion") {
      // Permiten espacios internos pero no al inicio
      cleanValue = value.replace(/^\s+/, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "activo" ? Number(cleanValue) : cleanValue,
    }));
  }, []);

  const guardarArea = useCallback(async () => {
    try {
      if (!formData.nombre || formData.nombre.trim() === "") {
        addNotification({ message: "El nombre es obligatorio", type: "error" });
        return;
      }
      if (camposIncompletos) {
        addNotification({
          message: "Por favor complete todos los campos obligatorios",
          type: "error",
        });
        return;
      }

      const payloadSanitizado = {
        ...formData,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
      };

      if (modoEdicion) {
        await apiService.updateArea(formData.id, payloadSanitizado);
        addNotification({
          message: "Área actualizada correctamente",
          type: "success",
        });
      } else {
        await apiService.createArea(payloadSanitizado);
        addNotification({
          message: "Área creada correctamente",
          type: "success",
        });
      }
      setMostrarModal(false);
      recargar();
    } catch (error) {
      console.error("Error guardando área:", error);
      addNotification({
        message: "Error guardando área: " + (error.message || ""),
        type: "error",
      });
    }
  }, [formData, camposIncompletos, modoEdicion, addNotification, recargar]);

  return {
    mostrarModal,
    modoEdicion,
    formData,
    camposIncompletos,
    abrirModalNueva,
    abrirModalEditar,
    cerrarModal,
    handleChange,
    guardarArea,
  };
}
