import { useState, useMemo, useCallback } from "react";
import { apiService } from "../../../../services/api";

const FORM_VACIO = {
  codigo: "",
  nombre: "",
  direccion: "",
  barrio: "",
  ciudad: "",
  departamento: "",
  activo: 1,
};

/**
 * Encapsula el estado y las operaciones del modal de sede: datos del
 * formulario, apertura en modo nuevo/edición y guardado. Tras guardar,
 * invoca `recargar` para refrescar el listado.
 */
export function useSedeForm({ recargar, addNotification }) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [sedeActual, setSedeActual] = useState(null);
  const [formData, setFormData] = useState(FORM_VACIO);

  const camposIncompletos = useMemo(
    () => !formData.codigo.trim() || !formData.nombre.trim(),
    [formData.codigo, formData.nombre],
  );

  const abrirModalNueva = useCallback(() => {
    setModoEdicion(false);
    setSedeActual(null);
    setFormData(FORM_VACIO);
    setMostrarModal(true);
  }, []);

  const abrirModalEditar = useCallback((sede) => {
    setModoEdicion(true);
    setSedeActual(sede);
    setFormData({
      codigo: sede.codigo || "",
      nombre: sede.nombre || "",
      direccion: sede.direccion || "",
      barrio: sede.barrio || "",
      ciudad: sede.ciudad || "",
      departamento: sede.departamento || "",
      activo: sede.activo ? 1 : 0,
    });
    setMostrarModal(true);
  }, []);

  const cerrarModal = useCallback(() => setMostrarModal(false), []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    let cleanValue = value;
    if (name === "codigo") {
      // Código nunca lleva espacios (ej: "B01")
      cleanValue = value.replace(/\s/g, "").toUpperCase();
    } else if (
      name === "nombre" ||
      name === "direccion" ||
      name === "barrio" ||
      name === "ciudad" ||
      name === "departamento"
    ) {
      // Permiten espacios internos pero no al inicio
      cleanValue = value.replace(/^\s+/, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "activo" ? Number(cleanValue) : cleanValue,
    }));
  }, []);

  const guardarSede = useCallback(async () => {
    try {
      if (camposIncompletos) {
        addNotification({
          message: "Por favor complete todos los campos obligatorios",
          type: "error",
        });
        return;
      }

      const payloadSanitizado = {
        ...formData,
        codigo: formData.codigo.trim(),
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim(),
        barrio: formData.barrio.trim(),
        ciudad: formData.ciudad.trim(),
        departamento: formData.departamento.trim(),
      };

      if (modoEdicion) {
        await apiService.updateSede(sedeActual.id, payloadSanitizado);
        addNotification({
          message: "Sede actualizada correctamente",
          type: "success",
        });
      } else {
        await apiService.createSede(payloadSanitizado);
        addNotification({
          message: "Sede creada correctamente",
          type: "success",
        });
      }
      setMostrarModal(false);
      recargar();
    } catch (error) {
      console.error("Error guardando sede:", error);
      addNotification({
        message: "Error al guardar la sede: " + error.message,
        type: "error",
      });
    }
  }, [
    camposIncompletos,
    modoEdicion,
    sedeActual,
    formData,
    addNotification,
    recargar,
  ]);

  return {
    mostrarModal,
    modoEdicion,
    formData,
    camposIncompletos,
    abrirModalNueva,
    abrirModalEditar,
    cerrarModal,
    handleChange,
    guardarSede,
  };
}
