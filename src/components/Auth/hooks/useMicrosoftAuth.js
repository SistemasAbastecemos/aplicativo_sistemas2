import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { buildMicrosoftAuthUrl } from "../utils/microsoftAuth";

const SILENT_CHECK_KEY = "ms_silent_login_attempted";
const LOGGED_OUT_KEY = "user_logged_out";

// Evaluacion sincrona antes del primer pintado en pantalla
const checkShouldAutoLogin = () => {
  if (typeof window === "undefined") return false;

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const msError = urlParams.get("error");
  const isLogout = urlParams.get("logout") === "true";

  const silentAttempted = sessionStorage.getItem(SILENT_CHECK_KEY);
  const wasLoggedOut = sessionStorage.getItem(LOGGED_OUT_KEY);

  return !code && !msError && !isLogout && !silentAttempted && !wasLoggedOut;
};

export const useMicrosoftAuth = (setError) => {
  const { loginWithMicrosoft } = useAuth();
  const navigate = useNavigate();

  // Se inicializa en true SÍNCRONAMENTE si cumple las condiciones de auto-login
  const [cargandoMS, setCargandoMS] = useState(() => checkShouldAutoLogin());
  const loginProcesadoRef = useRef(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const msError = urlParams.get("error");
    const isLogout = urlParams.get("logout") === "true";

    const cleanUrlParams = () => {
      window.history.replaceState({}, document.title, window.location.pathname);
    };

    if (isLogout) {
      cleanUrlParams();
      sessionStorage.setItem(LOGGED_OUT_KEY, "true");
      sessionStorage.setItem(SILENT_CHECK_KEY, "true");
      setCargandoMS(false);
      return;
    }

    if (msError) {
      cleanUrlParams();
      sessionStorage.setItem(SILENT_CHECK_KEY, "true");
      setCargandoMS(false);
      return;
    }

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
            setCargandoMS(false);
          }
        })
        .catch(() => {
          setError("Error al procesar las credenciales corporativas.");
          setCargandoMS(false);
        });
      return;
    }

    const silentAttempted = sessionStorage.getItem(SILENT_CHECK_KEY);
    const wasLoggedOut = sessionStorage.getItem(LOGGED_OUT_KEY);

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
        setCargandoMS(false);
      }
    } else {
      setCargandoMS(false);
    }
  }, [loginWithMicrosoft, navigate, setError]);

  const handleManualMicrosoftLogin = useCallback(() => {
    try {
      sessionStorage.removeItem(LOGGED_OUT_KEY);
      sessionStorage.removeItem(SILENT_CHECK_KEY);
      setCargandoMS(true);
      const authUrl = buildMicrosoftAuthUrl(false);
      window.location.href = authUrl;
    } catch (err) {
      setError(err.message || "Error al iniciar flujo corporativo.");
      setCargandoMS(false);
    }
  }, [setError]);

  return {
    cargandoMS,
    handleManualMicrosoftLogin,
  };
};
