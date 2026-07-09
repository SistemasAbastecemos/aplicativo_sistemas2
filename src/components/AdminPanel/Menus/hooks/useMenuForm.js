import { useState, useMemo, useEffect, useCallback } from "react";
import { apiService } from "../../../../services/api";

const FORM_VACIO = {
  nombre: "",
  ruta: "",
  icono: "",
  orden: "",
  id_parent: "",
  activo: 1,
};

/**
 * Encapsula el estado y las operaciones del modal de menú:
 * datos del formulario, matriz de permisos, filtro de cargos por área,
 * y las acciones de abrir (nuevo/editar) y guardar.
 */
export function useMenuForm({
  cargos,
  asegurarCatalogos,
  recargar,
  addNotification,
  puedeCrear,
  puedeEditar,
}) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [menuActual, setMenuActual] = useState(null);
  const [pestanaActiva, setPestanaActiva] = useState("datos");

  const [formData, setFormData] = useState(FORM_VACIO);
  const [permisos, setPermisos] = useState({ roles: {}, cargos: {} });

  const [areaSeleccionada, setAreaSeleccionada] = useState("");
  const [cargosFiltrados, setCargosFiltrados] = useState([]);

  const camposIncompletos = useMemo(
    () => !formData.nombre.trim() || !formData.ruta.trim(),
    [formData.nombre, formData.ruta],
  );

  // Filtra los cargos disponibles según el área seleccionada.
  useEffect(() => {
    if (areaSeleccionada) {
      setCargosFiltrados(cargos.filter((c) => c.id_area == areaSeleccionada));
    } else {
      setCargosFiltrados(cargos);
    }
  }, [areaSeleccionada, cargos]);

  const abrirModalNuevo = useCallback(async () => {
    await asegurarCatalogos();
    setModoEdicion(false);
    setMenuActual(null);
    setFormData(FORM_VACIO);
    setPermisos({ roles: {}, cargos: {} });
    setAreaSeleccionada("");
    setPestanaActiva("datos");
    setMostrarModal(true);
  }, [asegurarCatalogos]);

  const abrirModalEditar = useCallback(
    async (menu) => {
      await asegurarCatalogos();
      setModoEdicion(true);
      setMenuActual(menu);
      setFormData({
        nombre: menu.nombre ?? "",
        ruta: menu.ruta ?? "",
        icono: menu.icono ?? "",
        orden: menu.orden ?? "",
        id_parent: menu.id_parent ?? menu.id_menu_parent ?? "",
        activo: Number(menu.activo ?? 1),
        id: menu.id,
      });
      setPermisos(menu.permisos || { roles: {}, cargos: {} });
      setAreaSeleccionada("");
      setPestanaActiva("datos");
      setMostrarModal(true);
    },
    [asegurarCatalogos],
  );

  const cerrarModal = useCallback(() => setMostrarModal(false), []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;

    let cleanValue = value;
    if (type !== "checkbox") {
      if (name === "ruta" || name === "icono") {
        // Rutas e íconos nunca llevan espacios
        cleanValue = value.replace(/\s/g, "");
      } else if (name === "nombre") {
        // Nombre permite espacios internos pero no al inicio
        cleanValue = value.replace(/^\s+/, "");
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : cleanValue,
    }));
  }, []);

  const handleAreaChange = useCallback(
    (e) => setAreaSeleccionada(e.target.value),
    [],
  );

  // Alterna un permiso manteniendo la dependencia de "ver":
  // sin "ver" no puede haber otros permisos; marcar otro activa "ver".
  const togglePermiso = useCallback((tipo, id, campo) => {
    setPermisos((prev) => {
      const actual = prev[tipo]?.[id] || {};
      const nuevoValor = !actual[campo];
      let entrada = { ...actual, [campo]: nuevoValor };

      if (campo === "ver" && !nuevoValor) {
        entrada = { ver: false, crear: false, editar: false, eliminar: false };
      } else if (campo !== "ver" && nuevoValor) {
        entrada.ver = true;
      }

      return {
        ...prev,
        [tipo]: { ...prev[tipo], [id]: entrada },
      };
    });
  }, []);

  const guardarMenu = useCallback(async () => {
    try {
      if (!formData.nombre || formData.nombre.trim() === "") {
        addNotification({
          message: "El nombre es un parámetro obligatorio",
          type: "error",
        });
        return;
      }
      if (camposIncompletos) {
        addNotification({
          message: "Por favor complete todos los campos requeridos",
          type: "error",
        });
        return;
      }
      if ((modoEdicion && !puedeEditar) || (!modoEdicion && !puedeCrear)) {
        addNotification({
          message: "No tienes permiso para realizar esta acción.",
          type: "error",
        });
        return;
      }

      const payload = {
        ...formData,
        nombre: formData.nombre.trim(),
        ruta: formData.ruta.trim(),
        icono: formData.icono?.trim() ?? "",
        permisos,
        id_parent: formData.id_parent || null,
      };

      if (modoEdicion) {
        await apiService.updateMenu(menuActual.id, payload);
        addNotification({
          message: "Menú actualizado exitosamente",
          type: "success",
        });
      } else {
        await apiService.createMenu(payload);
        addNotification({
          message: "Menú registrado exitosamente",
          type: "success",
        });
      }

      setMostrarModal(false);
      recargar();
    } catch (error) {
      addNotification({
        message: "Fallo en operación: " + (error.message || ""),
        type: "error",
      });
    }
  }, [
    formData,
    permisos,
    camposIncompletos,
    modoEdicion,
    menuActual,
    puedeCrear,
    puedeEditar,
    addNotification,
    recargar,
  ]);

  return {
    mostrarModal,
    modoEdicion,
    formData,
    permisos,
    pestanaActiva,
    setPestanaActiva,
    areaSeleccionada,
    cargosFiltrados,
    camposIncompletos,
    puedeGuardar: modoEdicion ? puedeEditar : puedeCrear,
    abrirModalNuevo,
    abrirModalEditar,
    cerrarModal,
    handleChange,
    handleAreaChange,
    togglePermiso,
    guardarMenu,
  };
}
