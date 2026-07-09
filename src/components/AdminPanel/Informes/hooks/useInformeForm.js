import { useState, useCallback } from "react";
import { apiService } from "../../../../services/api";

export const useInformeForm = ({ recargar, addNotification }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [activeTab, setActiveTab] = useState("datos");
  const [cargoFilterArea, setCargoFilterArea] = useState("");

  const [formData, setFormData] = useState({
    id: null,
    titulo: "",
    url: "",
    descripcion: "",
    id_area: "",
    activo: 1,
    permisos: { areas: [], cargos: [] },
  });

  const abrirModalNuevo = useCallback(() => {
    setModoEdicion(false);
    setActiveTab("datos");
    setCargoFilterArea("");
    setFormData({
      id: null,
      titulo: "",
      url: "",
      descripcion: "",
      id_area: "",
      activo: 1,
      permisos: { areas: [], cargos: [] },
    });
    setModalOpen(true);
  }, []);

  const abrirModalEditar = useCallback((informe) => {
    setModoEdicion(true);
    setActiveTab("datos");
    setCargoFilterArea("");
    setFormData({
      id: informe.id,
      titulo: informe.titulo || "",
      url: informe.url || "",
      descripcion: informe.descripcion || "",
      id_area: informe.id_area || "",
      activo: Number(informe.activo),
      permisos: {
        areas: Array.isArray(informe.permisos?.areas)
          ? informe.permisos.areas.map(Number)
          : [],
        cargos: Array.isArray(informe.permisos?.cargos)
          ? informe.permisos.cargos.map(Number)
          : [],
      },
    });
    setModalOpen(true);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    // Selects numéricos y color: pasan tal cual
    if (name === "activo" || name === "id_area") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));
      return;
    }
    if (name === "color") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    // Texto
    let cleanValue = value;
    if (name === "url") {
      // URLs nunca llevan espacios
      cleanValue = value.replace(/\s/g, "");
    } else if (name === "titulo" || name === "descripcion") {
      // Permiten espacios internos pero no al inicio
      cleanValue = value.replace(/^\s+/, "");
    }

    setFormData((prev) => ({ ...prev, [name]: cleanValue }));
  }, []);

  const togglePermiso = useCallback((tipo, id) => {
    const targetId = Number(id);
    setFormData((prev) => {
      const listaActual = prev.permisos[tipo];
      const nuevaLista = listaActual.includes(targetId)
        ? listaActual.filter((x) => x !== targetId)
        : [...listaActual, targetId];
      return {
        ...prev,
        permisos: { ...prev.permisos, [tipo]: nuevaLista },
      };
    });
  }, []);

  const guardarInforme = useCallback(async () => {
    if (!formData.titulo.trim() || !formData.url.trim() || !formData.id_area) {
      addNotification({
        message: "Por favor complete todos los parámetros obligatorios",
        type: "error",
      });
      return;
    }
    try {
      const payloadSanitizado = {
        ...formData,
        titulo: formData.titulo.trim(),
        url: formData.url.trim(),
        descripcion: formData.descripcion.trim(),
      };

      if (modoEdicion) {
        await apiService.updateInforme(formData.id, payloadSanitizado);
        addNotification({
          message: "Módulo analítico actualizado",
          type: "success",
        });
      } else {
        await apiService.createInforme(payloadSanitizado);
        addNotification({
          message: "Módulo analítico registrado con éxito",
          type: "success",
        });
      }
      setModalOpen(false);
      recargar();
    } catch (error) {
      addNotification({
        message: "Error al procesar la transacción",
        type: "error",
      });
    }
  }, [formData, modoEdicion, recargar, addNotification]);

  return {
    modalOpen,
    modoEdicion,
    activeTab,
    cargoFilterArea,
    formData,
    setActiveTab,
    setCargoFilterArea,
    abrirModalNuevo,
    abrirModalEditar,
    handleChange,
    togglePermiso,
    guardarInforme,
    cerrarModal: () => setModalOpen(false),
  };
};
