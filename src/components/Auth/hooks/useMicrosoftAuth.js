import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { buildMicrosoftAuthUrl } from "../utils/microsoftAuth";

export const useMicrosoftAuth = (setError) => {
  const { loginWithMicrosoft } = useAuth();
  const navigate = useNavigate();
  const [cargandoMS, setCargandoMS] = useState(false);
  const loginProcesadoRef = useRef(false);

  const SILENT_CHECK_KEY = "ms_silent_login_attempted";
  const LOGGED_OUT_KEY = "user_logged_out";

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const msError = urlParams.get("error");
    const isLogout = urlParams.get("logout") === "true";

    const cleanUrlParams = () => {
      window.history.replaceState({}, document.title, window.location.pathname);
    };

    // Caso 1: Redireccion explicita desde el boton de Cierre de Sesion
    if (isLogout) {
      cleanUrlParams();
      sessionStorage.setItem(LOGGED_OUT_KEY, "true");
      sessionStorage.setItem(SILENT_CHECK_KEY, "true");
      return;
    }

    // Caso 2: Regreso de intento silencioso fallido o interaccion requerida
    if (msError) {
      cleanUrlParams();
      sessionStorage.setItem(SILENT_CHECK_KEY, "true");
      return;
    }

    // Caso 3: Procesamiento de codigo OAuth retornado por Microsoft
    if (code && !loginProcesadoRef.current) {
      loginProcesadoRef.current = true;
      setCargandoMS(true);
      cleanUrlParams();

      const targetRedirect = `${window.location.origin}/login`;
      loginWithMicrosoft(code, targetRedirect)
        .then((result) => {
          if (result?.success) {
            sessionStorage.removeItem(SILENT_CHECK_KEY);
            sessionStorage.removeItem(LOGGED_OUT_KEY);
            navigate("/inicio", { replace: true });
          } else {
            setError(result?.message || "Fallo la autenticacion corporativa.");
          }
        })
        .catch(() => {
          setError("Error al procesar las credenciales corporativas.");
        })
        .finally(() => {
          setCargandoMS(false);
        });
      return;
    }

    // Caso 4: Intento de auto-login silencioso inicial
    const silentAttempted = sessionStorage.getItem(SILENT_CHECK_KEY);
    const wasLoggedOut = sessionStorage.getItem(LOGGED_OUT_KEY);

    // Solo se intenta si no ha sido procesado, no se ha intentado antes y el usuario no cerro sesion voluntariamente
    if (
      !code &&
      !silentAttempted &&
      !wasLoggedOut &&
      !loginProcesadoRef.current
    ) {
      try {
        sessionStorage.setItem(SILENT_CHECK_KEY, "true");
        const silentUrl = buildMicrosoftAuthUrl(true);
        window.location.href = silentUrl;
      } catch (err) {
        // Omision si faltan variables de entorno
      }
    }
  }, [loginWithMicrosoft, navigate, setError]);

  const handleManualMicrosoftLogin = useCallback(() => {
    try {
      // Limpia banderas de bloqueo cuando el usuario presiona voluntariamente el boton
      sessionStorage.removeItem(LOGGED_OUT_KEY);
      sessionStorage.removeItem(SILENT_CHECK_KEY);
      const authUrl = buildMicrosoftAuthUrl(false);
      window.location.href = authUrl;
    } catch (err) {
      setError(err.message || "Error al iniciar flujo corporativo.");
    }
  }, [setError]);

  return {
    cargandoMS,
    handleManualMicrosoftLogin,
  };
};
