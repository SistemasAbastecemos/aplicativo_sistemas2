import { useCallback } from "react";

/**
 * Encapsula la activación del "modo kiosco": pantalla completa +
 * rotación bloqueada en landscape. Ambas operaciones son best-effort
 * — si el navegador o el dispositivo no las soporta, no se lanza
 * ninguna excepción visible.
 *
 * Se expone como función `activar()` en lugar de un useEffect
 * automático porque:
 *  - Los navegadores solo permiten fullscreen tras un gesto del
 *    usuario (submit del login), no al montar.
 *  - Reutilizar la misma lógica al montar y al hacer login evita
 *    duplicar el try/catch.
 */
export function useKioskMode() {
  const activar = useCallback(async () => {
    try {
      const docEl = document.documentElement;
      if (!document.fullscreenElement) {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        }
      }
      if (screen.orientation?.lock) {
        try {
          await screen.orientation.lock("landscape");
        } catch (_) {
          // El bloqueo de orientación puede fallar en desktop o cuando
          // no hay fullscreen — no es crítico
        }
      }
    } catch (_) {
      // Fullscreen puede fallar si no hay gesto de usuario reciente —
      // seguimos operando sin él
    }
  }, []);

  return { activar };
}
