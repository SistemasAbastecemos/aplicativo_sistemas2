import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";
import {
  FaUserCircle,
  FaKey,
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import logo from "../../assets/images/logo.png";
import styles from "./Login.module.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    login: "",
    email: "",
    password: "",
  });
  const [mode, setMode] = useState("login");
  const { login, loginWithMicrosoft, error, setError } = useAuth();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Candado de control para evitar ejecuciones duplicadas por el ciclo de vida de React
  const loginProcesadoRef = useRef(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    setCargando(true);
    e.preventDefault();
    if (submitting) return;

    try {
      if (mode === "login") {
        const data = await login({
          login: credentials.login,
          password: credentials.password,
        });

        if (data.success) {
          navigate("/inicio");
        } else {
          throw new Error(data.message || "Credenciales invalidas");
        }
      }

      if (mode === "forgot") {
        const data = await apiService.forgotPassword({
          login: credentials.login,
        });

        if (data.success) {
          alert("Se ha enviado un enlace de recuperacion a tu correo.");
          setMode("login");
        } else {
          throw new Error(data.message || "No se pudo enviar el enlace");
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
      setSubmitting(false);
    }
  };

  // Interceptar el retorno seguro desde la pasarela de Microsoft Entra ID
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code || loginProcesadoRef.current) return;

    // Bloqueo inmediato antes de cualquier operacion asincrona o cambio de estado
    loginProcesadoRef.current = true;

    const procesarLoginCorporativo = async () => {
      setCargando(true);
      setError("");

      try {
        const targetRedirect = window.location.origin + "/login";

        // Limpiar la URL de inmediato para evitar re-ejecuciones en refrescos accidentales
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );

        const result = await loginWithMicrosoft(code, targetRedirect);

        if (result.success) {
          navigate("/inicio", { replace: true });
        } else {
          // Si el backend responde un error controlado, no liberamos el candado para este code
          setError(result.message || "Fallo en la autenticacion corporativa.");
        }
      } catch (err) {
        setError(
          "Fallo al procesar credenciales corporativas o cuenta no vinculada.",
        );
        // No reactivamos loginProcesadoRef de forma automatica para evitar loops con el mismo code invalido
      } finally {
        setCargando(false);
      }
    };

    procesarLoginCorporativo();
  }, [loginWithMicrosoft, navigate, setError]);

  const handleMicrosoftLoginClick = () => {
    const tenantId = import.meta.env.VITE_MICROSOFT_TENANT_ID;
    const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;

    const targetRedirect = window.location.origin + "/login";
    const redirectUri = encodeURIComponent(targetRedirect);
    const scope = encodeURIComponent("openid profile email User.Read");

    if (!tenantId || !clientId) {
      setError(
        "Error de configuracion en las variables de entorno del cliente.",
      );
      return;
    }

    window.location.href = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=${scope}`;
  };

  // Evaluamos si el flujo viene con un codigo activo en la URL para renderizar la pantalla de espera
  const urlParams = new URLSearchParams(window.location.search);
  const tieneCodigoActive = urlParams.has("code");

  return (
    <div className={styles.loginWrapper}>
      {/* Columna izquierda */}
      <div className={styles.leftPanel}>
        <motion.img
          src={logo}
          alt="Logo"
          className={styles.panelLogo}
          initial={{ opacity: 0, scale: 0.8, y: -30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring" }}
          whileHover={{ scale: 1.1 }}
        />
        <h2 className={styles.panelTitle}>Abastecemos de Occidente S.A.S</h2>
        <p className={styles.panelText}>
          Bienvenid@ a nuestro aplicativo de Supermercado Belalcazar.
        </p>
      </div>

      {/* Columna derecha */}
      <div className={styles.rightPanel}>
        <div className={styles.cardWrap}>
          <div className={styles.decorCard} aria-hidden="true" />

          {mode === "login" && (
            <motion.div
              key="login"
              className={styles.loginCard}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              <motion.img
                src={logo}
                alt="Logo"
                className={styles.logoMobile}
                initial={{ scale: 0, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.7, type: "spring" }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              />

              <motion.div
                initial={{ scale: 0, opacity: 0, y: -30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.7, type: "spring" }}
                whileHover={{ scale: 1.1, rotate: 10, color: "#2a8a3a" }}
              >
                <FaUserCircle className={styles.userIcon} />
              </motion.div>
              <h2 className={styles.loginTitle}>Iniciar Sesión</h2>

              <form onSubmit={handleSubmit} className={styles.loginForm}>
                <div className={styles.loginInputGroup}>
                  <input
                    type="text"
                    name="login"
                    placeholder="Usuario"
                    value={credentials.login}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.loginInputGroup}>
                  <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className={styles.loginButton}
                  disabled={cargando}
                >
                  {cargando ? "Iniciando sesión..." : "Ingresar"}
                </button>

                <div className={styles.microsoftContainer}>
                  <div className={styles.dividerOr}>
                    <span>O</span>
                  </div>
                  <button
                    type="button"
                    className={styles.loginButtonMicrosoft}
                    onClick={handleMicrosoftLoginClick}
                    disabled={cargando}
                  >
                    <svg
                      className={styles.msIcon}
                      viewBox="0 0 23 23"
                      width="18"
                      height="18"
                    >
                      <path fill="#f3f2f1" d="M0 0h23v23H0z" />
                      <path fill="#f25022" d="M1 1h10v10H1z" />
                      <path fill="#7fba00" d="M12 1h10v10H12z" />
                      <path fill="#00a4ef" d="M1 12h10v10H1z" />
                      <path fill="#ffb900" d="M12 12h10v10H12z" />
                    </svg>
                    <span>Cuenta Corporativa Microsoft</span>
                  </button>
                </div>
              </form>

              {error && <p className={styles.loginError}>{error}</p>}

              <footer className={styles.loginFooter}>
                <ul className={styles.firmaList}>
                  <li>
                    <FaPhoneAlt className={styles.icono} /> 669 5778 | Ext 132
                    -109
                  </li>
                  <li>
                    <FaEnvelope className={styles.icono} />{" "}
                    <a
                      href="mailto:sistemas@supermercadobelalcazar.com.co"
                      className={styles.enlace}
                    >
                      sistemas@supermercadobelalcazar.com.co
                    </a>
                  </li>
                  <li>
                    <FaGlobe className={styles.icono} />
                    <a
                      href="https://supermercadobelalcazar.com.co"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.enlace}
                    >
                      supermercado.com.co
                    </a>
                  </li>
                  <li>
                    <FaMapMarkerAlt className={styles.icono} /> Oficina
                    Principal, Yumbo - Valle
                  </li>
                </ul>
              </footer>
            </motion.div>
          )}

          {mode === "forgot" && (
            <motion.div
              key="forgot"
              className={styles.loginCard}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                initial={{ scale: 0, rotate: 90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.6, type: "spring" }}
                whileHover={{ scale: 1.1, color: "#d9534f" }}
                className={styles.forgotIcon}
              >
                <FaKey />
              </motion.div>

              <h2 className={styles.loginTitle}>Recuperar Contraseña</h2>
              <form onSubmit={handleSubmit} className={styles.loginForm}>
                <div className={styles.loginInputGroup}>
                  <input
                    type="number"
                    name="login"
                    placeholder="Usuario"
                    value={credentials.login}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className={styles.loginButton}>
                  Enviar enlace
                </button>
              </form>

              <div className={styles.extraLinks}>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => setMode("login")}
                >
                  ? Volver al Login
                </button>
              </div>

              {error && <p className={styles.loginError}>{error}</p>}

              <footer className={styles.loginFooter}>
                <ul className={styles.firmaList}>
                  <li>
                    <FaPhoneAlt className={styles.icono} /> 669 5778 | Ext 132
                    -109
                  </li>
                  <li>
                    <FaEnvelope className={styles.icono} />{" "}
                    <a
                      href="mailto:sistemas@supermercadobelalcazar.com.co"
                      className={styles.enlace}
                    >
                      sistemas@supermercadobelalcazar.com.co
                    </a>
                  </li>
                  <li>
                    <FaGlobe className={styles.icono} />
                    <a
                      href="https://supermercadobelalcazar.com.co"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.enlace}
                    >
                      supermercado.com.co
                    </a>
                  </li>
                  <li>
                    <FaMapMarkerAlt className={styles.icono} /> Oficina
                    Principal, Yumbo - Valle
                  </li>
                </ul>
              </footer>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
