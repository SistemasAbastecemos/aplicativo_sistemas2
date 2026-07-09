/**
 * Conjunto de utilidades puras para validación de formularios empresariales.
 */
export const validationUtils = {
  validarPassword(password, confirmPassword) {
    if (!password && !confirmPassword) {
      return { valido: true, mensaje: "" };
    }
    if (password.length < 6) {
      return {
        valido: false,
        mensaje: "La contraseña debe tener al menos 6 caracteres",
      };
    }
    if (password !== confirmPassword) {
      return { valido: false, mensaje: "Las contraseñas no coinciden" };
    }
    return { valido: true, mensaje: "" };
  },
};
