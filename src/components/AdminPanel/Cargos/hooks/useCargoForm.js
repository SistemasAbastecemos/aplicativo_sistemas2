import { useState, useMemo, useCallback } from "react";
import { apiService } from "../../../../services/api";

export const useCargoForm = ({
  cargarAreas,
  recargar,
  addNotification,
  puedeCrear,
  puedeEditar,
  pagina,
  search,
}) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [cargoActual, setCargoActual] = useState(null);

  const [formData, setFormData] = useState({
    id_area: "",
    nombre: "",
    descripcion: "",
    nivel: 1,
    activo: 1,
  });

  const camposIncompletos = useMemo(
    () =>
      !formData.nombre.trim() ||
      !formData.descripcion.trim() ||
      !formData.id_area,
    [formData.nombre, formData.descripcion, formData.id_area],
  );

  const abrirModalNuevo = useCallback(async () => {
    await cargarAreas();
    setModoEdicion(false);
    setCargoActual(null);
    setFormData({
      id_area: "",
      nombre: "",
      descripcion: "",
      nivel: 1,
      activo: 1,
    });
    setMostrarModal(true);
  }, [cargarAreas]);

  const abrirModalEditar = useCallback(
    async (cargo) => {
      await cargarAreas();
      setModoEdicion(true);
      setCargoActual(cargo);
      setFormData({
        id_area: cargo.id_area ?? "",
        nombre: cargo.nombre ?? "",
        descripcion: cargo.descripcion ?? "",
        nivel: cargo.nivel ?? 1,
        activo: Number(cargo.activo ?? 1),
        id: cargo.id,
      });
      setMostrarModal(true);
    },
    [cargarAreas],
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    // Selects numéricos: normalizamos como antes
    if (name === "activo" || name === "nivel" || name === "id_area") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));
      return;
    }

    // Texto: bloqueamos espacios iniciales en tiempo real
    let cleanValue = value;
    if (name === "nombre" || name === "descripcion") {
      cleanValue = value.replace(/^\s+/, "");
    }

    setFormData((prev) => ({ ...prev, [name]: cleanValue }));
  }, []);

  const guardarCargo = useCallback(async () => {
    if (!formData.nombre.trim()) {
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
    if ((modoEdicion && !puedeEditar) || (!modoEdicion && !puedeCrear)) {
      addNotification({
        message: "No posees autorización para esta operación.",
        type: "error",
      });
      return;
    }

    try {
      const payloadSanitizado = {
        ...formData,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
      };

      if (modoEdicion) {
        await apiService.updateCargo(formData.id, payloadSanitizado);
        addNotification({
          message: "Cargo actualizado correctamente",
          type: "success",
        });
      } else {
        await apiService.createCargo(payloadSanitizado);
        addNotification({
          message: "Cargo registrado correctamente",
          type: "success",
        });
      }
      setMostrarModal(false);
      recargar(pagina, search);
    } catch (error) {
      console.error("Error guardando cargo:", error);
      addNotification({
        message: "Error guardando cargo: " + (error.message || ""),
        type: "error",
      });
    }
  }, [
    formData,
    camposIncompletos,
    modoEdicion,
    puedeCrear,
    puedeEditar,
    pagina,
    search,
    recargar,
    addNotification,
  ]);

  return {
    mostrarModal,
    modoEdicion,
    formData,
    camposIncompletos,
    abrirModalNuevo,
    abrirModalEditar,
    handleChange,
    guardarCargo,
    cerrarModal: () => setMostrarModal(false),
  };
};
