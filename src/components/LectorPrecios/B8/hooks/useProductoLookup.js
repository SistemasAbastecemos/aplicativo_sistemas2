import { useState, useRef, useEffect, useCallback } from "react";
import { apiService } from "../../../../services/api";
import { SEDE_ID, TIEMPO_ESPERA_PANTALLA } from "../utils/constants";

/**
 * Encapsula la consulta al backend y el countdown automático de regreso
 * a la pantalla de bienvenida tras mostrar un resultado.
 *
 * Estados manejados:
 *  - `producto`: el resultado del backend (null si no hay).
 *  - `errorProducto`: true si la consulta falló o no devolvió data.
 *  - `cargando`: true durante el fetch (bloquea la UI).
 *  - `escannerActivo`: true durante 2s tras un escaneo (para animación).
 *  - `tiempoRestante`: segundos del countdown; al llegar a 0 limpia todo.
 *
 * Los sonidos success/error se reciben como refs desde el orquestador
 * para reproducirlos aquí (evita cargar el audio dentro del hook).
 */
export function useProductoLookup({ audioSuccess, audioError }) {
  const [producto, setProducto] = useState(null);
  const [errorProducto, setErrorProducto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [escannerActivo, setEscannerActivo] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(0);

  const countdownIntervalRef = useRef(null);

  const iniciarContadorRegresivo = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setTiempoRestante(TIEMPO_ESPERA_PANTALLA);

    countdownIntervalRef.current = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          setProducto(null);
          setErrorProducto(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const manejarFalloLectura = useCallback(() => {
    setProducto(null);
    setErrorProducto(true);
    try {
      audioError.current.play();
    } catch (_) {}
    iniciarContadorRegresivo();
  }, [audioError, iniciarContadorRegresivo]);

  /**
   * Consulta el producto por código de barras. Aplica trim al código.
   * Nombre exacto del API preservado: `apiService.getProductoBarras`.
   */
  const procesarCodigo = useCallback(
    async (codigoRaw) => {
      const codigo = (codigoRaw || "").trim();
      if (!codigo) return;

      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      setCargando(true);
      setErrorProducto(false);
      setEscannerActivo(true);

      try {
        const response = await apiService.getProductoBarras(codigo, SEDE_ID);

        if (response && response.success && response.data) {
          setProducto(response.data);
          try {
            audioSuccess.current.play();
          } catch (_) {}
          iniciarContadorRegresivo();
        } else {
          manejarFalloLectura();
        }
      } catch (_) {
        manejarFalloLectura();
      } finally {
        setCargando(false);
        // Mantiene la animación del escáner activa 2s más para dar feedback
        setTimeout(() => setEscannerActivo(false), 2000);
      }
    },
    [audioSuccess, iniciarContadorRegresivo, manejarFalloLectura],
  );

  const activarEscaner = useCallback(() => {
    setEscannerActivo(true);
  }, []);

  const desactivarEscaner = useCallback(() => {
    setEscannerActivo(false);
  }, []);

  // Cleanup del countdown al desmontar
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  return {
    producto,
    errorProducto,
    cargando,
    escannerActivo,
    tiempoRestante,
    procesarCodigo,
    activarEscaner,
    desactivarEscaner,
  };
}
