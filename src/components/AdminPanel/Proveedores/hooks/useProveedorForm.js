import { useState, useMemo, useCallback } from "react";
import { apiService } from "../../../../services/api";

export const useProveedorForm = ({
  recargar,
  addNotification,
  puedeCrear,
  puedeEditar,
  pagina,
  search,
}) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [proveedorActual, setProveedorActual] = useState(null);
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  const [formData, setFormData] = useState({
    nit: "",
    correo: "",
    contrasena: "",
    activo: 1,
  });

  const errorContrasena = useMemo(() => {
    if (!modoEdicion && !formData.contrasena)
      return "La contraseña es requerida";
    if (formData.contrasena && formData.contrasena.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }
    if (formData.contrasena !== confirmarContrasena) {
      return "Las contraseñas no coinciden";
    }
    return "";
  }, [formData.contrasena, confirmarContrasena, modoEdicion]);

  const camposIncompletos = useMemo(() => {
    // Usamos .trim() en todos los strings obligatorios para validar de verdad si tienen texto
    const camposBase = !formData.nit?.trim() || !formData.correo?.trim();
    if (modoEdicion) return camposBase;
    return camposBase || !formData.contrasena?.trim();
  }, [formData, modoEdicion]);

  const abrirModalNuevo = useCallback(() => {
    setModoEdicion(false);
    setProveedorActual(null);
    setConfirmarContrasena("");
    setFormData({ nit: "", correo: "", contrasena: "", activo: 1 });
    setMostrarModal(true);
  }, []);

  const abrirModalEditar = useCallback((proveedor) => {
    setModoEdicion(true);
    setProveedorActual(proveedor);
    setConfirmarContrasena("");
    setFormData({
      nit: proveedor.nit ?? "",
      correo: proveedor.correo ?? "",
      contrasena: "",
      activo: proveedor.activo ? 1 : 0,
      id: proveedor.id,
    });
    setMostrarModal(true);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    let cleanValue = value;
    if (name === "nit" || name === "correo") {
      // Elimina TODOS los espacios (NIT y correo nunca los tienen)
      cleanValue = value.replace(/\s/g, "");
    } else if (name === "contrasena") {
      // Solo bloquea espacios al inicio; deja escribir libremente el resto
      cleanValue = value.replace(/^\s+/, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "activo" ? Number(cleanValue) : cleanValue,
    }));
  }, []);

  const guardarProveedor = useCallback(async () => {
    if (camposIncompletos || errorContrasena) {
      addNotification({
        message: "Por favor, complete los campos obligatorios y contraseñas",
        type: "error",
      });
      return;
    }
    if ((modoEdicion && !puedeEditar) || (!modoEdicion && !puedeCrear)) {
      addNotification({
        message: "No dispones de credenciales para esta acción",
        type: "error",
      });
      return;
    }

    try {
      // Limpiamos todos los valores antes de enviar
      const payloadSanitizado = {
        ...formData,
        nit: formData.nit.trim(),
        correo: formData.correo.trim(),
        contrasena: formData.contrasena ? formData.contrasena.trim() : "",
      };

      if (modoEdicion) {
        // Si la contraseña está vacía (con puros espacios), la eliminamos para no sobreescribirla
        if (!payloadSanitizado.contrasena) {
          delete payloadSanitizado.contrasena;
        }
        await apiService.updateProveedor(formData.id, payloadSanitizado);
        addNotification({
          message: "Proveedor actualizado con éxito",
          type: "success",
        });
      } else {
        await apiService.createProveedor(payloadSanitizado);
        addNotification({
          message: "Proveedor registrado con éxito",
          type: "success",
        });
      }
      setMostrarModal(false);
      // Recargamos usando la búsqueda con trim aplicado
      recargar(pagina, search.trim());
    } catch (error) {
      console.error("Error guardando proveedor:", error);
      addNotification({
        message: "Fallo operacional: " + (error.message || ""),
        type: "error",
      });
    }
  }, [
    formData,
    confirmarContrasena,
    errorContrasena,
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
    confirmarContrasena,
    setConfirmarContrasena,
    errorContrasena,
    camposIncompletos,
    abrirModalNuevo,
    abrirModalEditar,
    handleChange,
    guardarProveedor,
    cerrarModal: () => setMostrarModal(false),
  };
};
