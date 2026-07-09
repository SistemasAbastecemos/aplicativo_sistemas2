import { useState, useCallback } from "react";
import { apiService } from "../../../../services/api";
import { puedeEditarMeta } from "../utils/permissions";

/**
 * Encapsula la edición inline del título de una separata. La UI llama a
 * `iniciarEdicion(separata)`, edita `tituloEditar`, y confirma con `guardar()`.
 *
 * `onUpdated(separataId, nuevoTitulo)` se dispara tras un guardado exitoso
 * para que el orquestador refresque el listado y, si corresponde, el detalle
 * actual.
 */
export function useTituloEditor({ login, addNotification, onUpdated }) {
  const [editingSeparataId, setEditingSeparataId] = useState(null);
  const [tituloEditar, setTituloEditar] = useState("");
  const [editandoTitulo, setEditandoTitulo] = useState(false);

  const puedeEditar = puedeEditarMeta(login);

  const iniciarEdicion = useCallback(
    (separata) => {
      if (!puedeEditar) return;
      setEditingSeparataId(separata.id);
      setTituloEditar(separata.titulo || "");
    },
    [puedeEditar],
  );

  const cancelarEdicion = useCallback(() => {
    setEditingSeparataId(null);
    setTituloEditar("");
  }, []);

  const handleTituloChange = useCallback((e) => {
    // Bloquea espacios iniciales durante la escritura; trim final al guardar.
    setTituloEditar(e.target.value.replace(/^\s+/, ""));
  }, []);

  const guardar = useCallback(
    async (separataId) => {
      if (!puedeEditar) return;

      const tituloLimpio = tituloEditar.trim();
      setEditandoTitulo(true);
      try {
        const response = await apiService.updateSeparataTitle(
          separataId,
          tituloLimpio,
          login,
        );

        if (response.success) {
          addNotification({
            message: response.message || "Título actualizado correctamente",
            type: "success",
          });
          if (onUpdated) await onUpdated(separataId, tituloLimpio);
          setEditingSeparataId(null);
          setTituloEditar("");
        } else {
          addNotification({
            message: response.message || "Error al actualizar el título",
            type: "error",
          });
        }
      } catch (error) {
        console.error("Error en guardarTitulo:", error);
        if (error.response) {
          addNotification({
            message: error.response.data?.message || "Error del servidor",
            type: "error",
          });
        } else if (error.request) {
          addNotification({
            message: "Error de conexión al actualizar el título",
            type: "error",
          });
        } else {
          addNotification({
            message: "Error actualizando título: " + error.message,
            type: "error",
          });
        }
      } finally {
        setEditandoTitulo(false);
      }
    },
    [tituloEditar, login, puedeEditar, addNotification, onUpdated],
  );

  return {
    editingSeparataId,
    setEditingSeparataId,
    tituloEditar,
    setTituloEditar,
    editandoTitulo,
    puedeEditar,
    iniciarEdicion,
    cancelarEdicion,
    handleTituloChange,
    guardar,
  };
}
