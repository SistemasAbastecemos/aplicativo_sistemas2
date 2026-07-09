import { useState, useEffect, useCallback, useMemo } from "react";
import { apiService } from "../../../services/api";

export const usePerfilForm = (currentUser, addNotification) => {
  const [cargando, setCargando] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [userInfo, setUserInfo] = useState({
    nombres_completos: "",
    login: "",
    correo: "",
    sede: "",
    area: "",
    cargo: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const camposIncompletos = useMemo(() => {
    if (editMode && (userInfo.password || userInfo.confirmPassword)) {
      return (
        !userInfo.nombres_completos?.trim() ||
        !userInfo.correo?.trim() ||
        !!passwordError
      );
    }
    return !userInfo.nombres_completos?.trim() || !userInfo.correo?.trim();
  }, [userInfo, editMode, passwordError]);

  const puedeEditar = useMemo(() => {
    return !!(currentUser && currentUser.id);
  }, [currentUser]);

  const cargarPerfil = useCallback(async () => {
    if (!currentUser?.id) return;
    setCargando(true);
    try {
      const data = await apiService.getPerfilUsuario();
      setUserInfo({
        nombres_completos: data.nombres_completos || "",
        login: data.login || currentUser.login || "",
        correo: data.correo || "",
        sede: data.sede_nombre || data.sede || "",
        area: data.area_nombre || data.area || "",
        cargo: data.cargo_nombre || data.cargo || "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error cargando perfil:", error);
      addNotification({
        message: "Error cargando información del perfil",
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  }, [currentUser, addNotification]);

  useEffect(() => {
    if (puedeEditar) {
      cargarPerfil();
    }
  }, [puedeEditar, cargarPerfil]);

  const checkPasswordStrength = useCallback((password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    setPasswordRequirements(requirements);
    const strength = Object.values(requirements).filter(Boolean).length;
    setPasswordStrength(strength);
  }, []);

  const validatePasswords = useCallback((password, confirmPassword) => {
    if (!password && !confirmPassword) {
      setPasswordError("");
      return true;
    }

    if (!password || !confirmPassword) {
      setPasswordError("Ambos campos de contraseña son obligatorios");
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return false;
    }

    if (password.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres");
      return false;
    }

    setPasswordError("");
    return true;
  }, []);

  useEffect(() => {
    if (userInfo.password) {
      checkPasswordStrength(userInfo.password);
    } else {
      setPasswordStrength(0);
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      });
    }
  }, [userInfo.password, checkPasswordStrength]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setUserInfo((prev) => {
        const updated = { ...prev, [name]: value };
        if (name === "password" || name === "confirmPassword") {
          validatePasswords(
            name === "password" ? value : updated.password,
            name === "confirmPassword" ? value : updated.confirmPassword,
          );
        }
        return updated;
      });
    },
    [validatePasswords],
  );

  const cancelarEdicion = useCallback(() => {
    setEditMode(false);
    setPasswordError("");
    setUserInfo((prev) => ({
      ...prev,
      password: "",
      confirmPassword: "",
    }));
    setPasswordStrength(0);
    cargarPerfil();
  }, [cargarPerfil]);

  const guardarCambios = useCallback(async () => {
    if (!validatePasswords(userInfo.password, userInfo.confirmPassword)) {
      addNotification({
        message: "Por favor corrige los errores en las contraseñas",
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

    setCargando(true);
    try {
      const datosParaEnviar = {
        nombres_completos: userInfo.nombres_completos,
        correo: userInfo.correo,
        ...(userInfo.password && { password: userInfo.password }),
      };

      const response = await apiService.updatePerfilUsuario(datosParaEnviar);

      if (response.success) {
        addNotification({
          message: "Perfil actualizado correctamente",
          type: "success",
        });
        setEditMode(false);
        setUserInfo((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));
        setPasswordStrength(0);
      } else {
        throw new Error(response.message || "Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      addNotification({
        message: error.message || "Error al actualizar el perfil",
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  }, [userInfo, camposIncompletos, validatePasswords, addNotification]);

  return {
    userInfo,
    cargando,
    editMode,
    passwordError,
    passwordStrength,
    passwordRequirements,
    camposIncompletos,
    puedeEditar,
    setEditMode,
    handleChange,
    cancelarEdicion,
    guardarCambios,
  };
};
