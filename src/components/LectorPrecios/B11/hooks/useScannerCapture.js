import { useRef, useEffect, useCallback } from "react";
import {
  LARGO_MINIMO_CODIGO,
  PAUSA_FIN_ESCANEO,
} from "../utils/constants";

/**
 * Captura del escáner de códigos de barras (USB o lector integrado
 * Android). El escaneo se inyecta como texto en un input oculto que
 * mantenemos siempre enfocado mientras el terminal esté activo.
 *
 * Se soportan dos formas de fin de escaneo:
 *  1. Enter: el lector envía \n al final del código (típico USB).
 *  2. Pausa: sin Enter, procesamos cuando pasan PAUSA_FIN_ESCANEO ms
 *     sin nuevos caracteres (típico en Android donde el lector
 *     integrado inyecta vía IME y e.key llega como "Unidentified").
 *
 * El input queda posicionado en (0, 0) con opacity 0 y pointer-events
 * none para no interferir con la UI. inputMode="none" previene que
 * salga el teclado virtual en Android sin bloquear la inyección del
 * lector.
 *
 * Props:
 *  - activo: si false, el hook no fuerza foco (usado durante el login).
 *  - cargando: si true, ignora los cambios (el fetch está en curso).
 *  - onCodigo: callback que recibe el código escaneado (ya trimeado).
 */
export function useScannerCapture({ activo, cargando, onCodigo }) {
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  // Mantener el input enfocado periódicamente y ante cualquier
  // toque/click. Sin esto, si el usuario toca la pantalla, el input
  // pierde foco y el próximo escaneo se pierde.
  useEffect(() => {
    if (!activo) return;

    const enfocar = () => {
      if (inputRef.current && !cargando) {
        inputRef.current.focus();
      }
    };

    enfocar();
    const intervalo = setInterval(enfocar, 500);
    window.addEventListener("click", enfocar);
    window.addEventListener("touchstart", enfocar);

    return () => {
      clearInterval(intervalo);
      window.removeEventListener("click", enfocar);
      window.removeEventListener("touchstart", enfocar);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [activo, cargando]);

  const procesarDesdeInput = useCallback(
    (valor) => {
      const codigo = (valor || "").trim();
      if (inputRef.current) inputRef.current.value = "";
      if (codigo) onCodigo(codigo);
    },
    [onCodigo],
  );

  // Modo 1: el lector envía Enter al final
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        procesarDesdeInput(e.target.value);
      }
    },
    [procesarDesdeInput],
  );

  // Modo 2: fallback por pausa (sin Enter)
  const handleChange = useCallback(
    (e) => {
      const valor = e.target.value;
      if (cargando) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (valor.trim().length >= LARGO_MINIMO_CODIGO) {
          procesarDesdeInput(valor);
        }
      }, PAUSA_FIN_ESCANEO);
    },
    [cargando, procesarDesdeInput],
  );

  return {
    inputRef,
    handleKeyDown,
    handleChange,
  };
}
