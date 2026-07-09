import { useState, useMemo, useEffect, useCallback } from "react";
import { apiService } from "../../../../services/api";

const FORM_VACIO = {
  nombres_completos: "",
  login: "",
  contrasena: "",
  correo: "",
  id_rol: "",
  id_area: "",
  id_cargo: "",
  id_sede: "",
  activo: 1,
};

/**
 * Encapsula el estado y las operaciones del modal de usuario: datos del
 * formulario, confirmación de contraseña, filtrado de cargos por área,
 * apertura en modo nuevo/edición y guardado.
 */
export function useUsuarioForm({ cargos, recargar, addNotification }) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [formData, setFormData] = useState(FORM_VACIO);
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [errorContrasena, setErrorContrasena] = useState("");
  const [cargosFiltrados, setCargosFiltrados] = useState([]);

  const camposIncompletos = useMemo(
    () =>
      !formData.nombres_completos.trim() ||
      !formData.login.trim() ||
      (!modoEdicion && !formData.contrasena.trim()) ||
      !formData.id_rol ||
      !formData.id_area ||
      !formData.id_cargo ||
      !formData.id_sede ||
      (!!errorContrasena && (formData.contrasena || confirmarContrasena)),
    [formData, modoEdicion, errorContrasena, confirmarContrasena],
  );

  // Valida que la contraseña y su confirmación coincidan.
  useEffect(() => {
    if (formData.contrasena || confirmarContrasena) {
      setErrorContrasena(
        formData.contrasena !== confirmarContrasena
          ? "Las contraseñas no coinciden"
          : "",
      );
    } else {
      setErrorContrasena("");
    }
  }, [formData.contrasena, confirmarContrasena]);

  // Filtra los cargos por el área seleccionada y limpia el cargo si ya no aplica.
  useEffect(() => {
    if (!formData.id_area) {
      setCargosFiltrados([]);
      return;
    }
    const filtrados = cargos.filter((c) => c.id_area == formData.id_area);
    setCargosFiltrados(filtrados);

    if (!filtrados.some((c) => c.id == formData.id_cargo)) {
      setFormData((prev) => ({ ...prev, id_cargo: "" }));
    }
  }, [formData.id_area, formData.id_cargo, cargos]);

  const abrirModalNuevo = useCallback(() => {
    setModoEdicion(false);
    setUsuarioActual(null);
    setConfirmarContrasena("");
    setErrorContrasena("");
    setFormData(FORM_VACIO);
    setMostrarModal(true);
  }, []);

  const abrirModalEditar = useCallback((usuario) => {
    setModoEdicion(true);
    setUsuarioActual(usuario);
    setConfirmarContrasena("");
    setErrorContrasena("");
    setFormData({
      nombres_completos: usuario.nombres_completos || "",
      login: usuario.login || "",
      contrasena: "",
      correo: usuario.correo || "",
      id_rol: usuario.id_rol || "",
      id_area: usuario.id_area || "",
      id_cargo: usuario.id_cargo || "",
      id_sede: usuario.id_sede || "",
      activo: usuario.activo ? 1 : 0,
    });
    setMostrarModal(true);
  }, []);

  const cerrarModal = useCallback(() => setMostrarModal(false), []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const guardarUsuario = useCallback(async () => {
    try {
      if (errorContrasena) {
        addNotification({
          message: "Las contraseñas no coinciden",
          type: "error",
        });
        return;
      }
      if (camposIncompletos) {
        addNotification({
          message: "Por favor complete todos los campos obligatorios",
          type: "error",
        });
        return;
      }

      const datosParaEnviar = {
        ...formData,
        id_rol: parseInt(formData.id_rol),
        id_area: parseInt(formData.id_area),
        id_cargo: parseInt(formData.id_cargo),
        id_sede: parseInt(formData.id_sede),
        activo: parseInt(formData.activo),
      };

      if (modoEdicion && !datosParaEnviar.contrasena) {
        delete datosParaEnviar.contrasena;
      }

      if (modoEdicion) {
        await apiService.updateUsuario(usuarioActual.id, datosParaEnviar);
        addNotification({
          message: "Usuario actualizado correctamente",
          type: "success",
        });
      } else {
        await apiService.createUsuario(datosParaEnviar);
        addNotification({
          message: "Usuario creado correctamente",
          type: "success",
        });
      }
      setMostrarModal(false);
      recargar();
    } catch (error) {
      console.error("Error guardando usuario:", error);
      addNotification({
        message: "Error al guardar el usuario: " + error.message,
        type: "error",
      });
    }
  }, [
    errorContrasena,
    camposIncompletos,
    formData,
    modoEdicion,
    usuarioActual,
    addNotification,
    recargar,
  ]);

  return {
    mostrarModal,
    modoEdicion,
    formData,
    confirmarContrasena,
    setConfirmarContrasena,
    errorContrasena,
    cargosFiltrados,
    camposIncompletos,
    abrirModalNuevo,
    abrirModalEditar,
    cerrarModal,
    handleChange,
    guardarUsuario,
  };
}
