import { useState, useCallback, useRef } from "react";
import { apiService } from "../../../../services/api";

/**
 * Encapsula la subida chunked del plano contable con:
 *  - Empresa y tipo seleccionables (con reglas de combinación válidas
 *    delegadas al backend)
 *  - Selector de archivo local
 *  - Progress porcentual via callback del apiService
 *  - Cancelación via AbortController
 *  - Reset automático del archivo tras éxito o error
 *
 * La ventana de tiempo entre "seleccionar archivo" y "subir" mantiene el
 * archivo en memoria pero no consume banda hasta que se confirma.
 */
export function useUploadPlano({ addNotification }) {
  const [file, setFile] = useState(null);
  const [empresa, setEmpresa] = useState("AB");
  const [tipo, setTipo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [progress, setProgress] = useState(0);

  const controllerRef = useRef(null);

  const handleFileChange = useCallback((e) => {
    setFile(e.target.files[0] || null);
  }, []);

  const handleEmpresaChange = useCallback((e) => {
    setEmpresa(e.target.value);
  }, []);

  const handleTipoChange = useCallback((e) => {
    setTipo(e.target.value);
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
  }, []);

  const cancelarSubida = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
  }, []);

  const subirArchivo = useCallback(async () => {
    if (!file) {
      addNotification({
        message: "Selecciona un archivo.",
        type: "warning",
      });
      return;
    }
    if (!empresa || !tipo) {
      addNotification({
        message: "Selecciona empresa y tipo.",
        type: "warning",
      });
      return;
    }

    setCargando(true);
    setProgress(0);
    const uploadId = `${file.name}_${Date.now()}`;
    const newController = new AbortController();
    controllerRef.current = newController;

    try {
      await apiService.updatePlanosContabilidad({
        file,
        empresa,
        tipo,
        uploadId,
        onProgress: (percent) => setProgress(percent),
        signal: newController.signal,
      });
      addNotification({
        message: "Archivo plano subido exitosamente.",
        type: "success",
      });
    } catch (err) {
      if (err.name === "AbortError") {
        addNotification({ message: "Subida cancelada.", type: "warning" });
      } else {
        addNotification({
          message: "Error al subir archivo plano.",
          type: "error",
        });
      }
    } finally {
      setCargando(false);
      setProgress(0);
      setFile(null);
      controllerRef.current = null;
    }
  }, [file, empresa, tipo, addNotification]);

  return {
    file,
    empresa,
    tipo,
    cargando,
    progress,
    handleFileChange,
    handleEmpresaChange,
    handleTipoChange,
    clearFile,
    subirArchivo,
    cancelarSubida,
  };
}
