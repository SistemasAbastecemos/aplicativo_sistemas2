import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";
import {
  FaUserCircle,
  FaKey,
  FaArrowLeft,
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "../UI/LoadingScreen";
import logo from "../../assets/images/logo.png";
import styles from "./Login.module.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    login: "",
    password: "",
  });
  const [mode, setMode] = useState("login");
  const { login, loginWithMicrosoft, error, setError } = useAuth();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loginProcesadoRef = useRef(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || cargando) return;

    setCargando(true);
    setSubmitting(true);
    setError("");

    try {
      if (mode === "login") {
        const data = await login({
          login: credentials.login,
          password: credentials.password,
        });

        if (data?.success) {
          navigate("/inicio");
        } else {
          throw new Error(data?.message || "Credenciales inválidas");
        }
      } else if (mode === "forgot") {
        const data = await apiService.forgotPassword({
          login: credentials.login,
        });

        if (data?.success) {
          alert("Se ha enviado un enlace de recuperación a tu correo.");
          setMode("login");
        } else {
          throw new Error(data?.message || "No se pudo enviar el enlace");
        }
      }
    } catch (err) {
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setCargando(false);
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code || loginProcesadoRef.current) return;
    loginProcesadoRef.current = true;

    const procesarLoginCorporativo = async () => {
      setCargando(true);
      setError("");

      try {
        const targetRedirect = `${window.location.origin}/login`;
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );

        const result = await loginWithMicrosoft(code, targetRedirect);
        if (result?.success) {
          navigate("/inicio", { replace: true });
        } else {
          setError(result?.message || "Fallo en la autenticación corporativa.");
        }
      } catch (err) {
        setError(
          "Fallo al procesar credenciales corporativas o cuenta no vinculada.",
        );
      } finally {
        setCargando(false);
      }
    };

    procesarLoginCorporativo();
  }, [loginWithMicrosoft, navigate, setError]);

  const handleMicrosoftLoginClick = () => {
    const tenantId = import.meta.env.VITE_MICROSOFT_TENANT_ID;
    const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
    const targetRedirect = `${window.location.origin}/login`;
    const redirectUri = encodeURIComponent(targetRedirect);
    const scope = encodeURIComponent("openid profile email User.Read");

    if (!tenantId || !clientId) {
      setError(
        "Error de configuración en las variables de entorno del cliente.",
      );
      return;
    }

    window.location.href = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=${scope}`;
  };

  return (
    <div className={styles.loginWrapper}>
      {cargando && (
        <LoadingScreen
          isVisible={true}
          title="Autenticando"
          subtitle="Por favor espera un momento..."
          variant="fullscreen"
        />
      )}

      {/* Bloque Izquierdo - Imagen de fondo con opacidad, luces ambientales y branding */}
      <div className={styles.leftPanel}>
        <div className={styles.bgImage} />
        {/* Elementos creativos decorativos: Luces de ambiente sutiles */}
        <motion.div
          className={styles.ambientLight1}
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 50, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className={styles.ambientLight2}
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -30, 0],
            scale: [1, 0.8, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className={styles.leftContent}>
          <motion.img
            src={logo}
            alt="Logo"
            className={styles.panelLogo}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
            style={{ willChange: "transform, opacity" }}
          />
          <motion.h2
            className={styles.panelTitle}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            style={{ willChange: "transform, opacity" }}
          >
            Abastecemos de Occidente S.A.S
          </motion.h2>
          <motion.p
            className={styles.panelText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            style={{ willChange: "transform, opacity" }}
          >
            Bienvenid@ a nuestro aplicativo de Supermercado Belalcázar.
          </motion.p>
        </div>
      </div>

      {/* Bloque Derecho: Lienzo del Formulario */}
      <div className={styles.rightPanel}>
        <div className={styles.cardWrap}>
          <div className={styles.decorCard} />

          <div className={styles.loginCard}>
            <img src={logo} alt="Logo Mobile" className={styles.logoMobile} />

            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <h1 className={styles.loginTitle}>Iniciar Sesión</h1>
                  <p className={styles.loginSubtitle}>
                    Ingresa tus credenciales para acceder al aplicativo.
                  </p>
                  <form onSubmit={handleSubmit} noValidate>
                    <div className={styles.loginInputGroup}>
                      <div className={styles.inputIconWrapper}>
                        <FaUserCircle className={styles.inputIcon} />
                        <input
                          type="text"
                          name="login"
                          placeholder="Usuario"
                          value={credentials.login}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.loginInputGroup}>
                      <div className={styles.inputIconWrapper}>
                        <FaKey className={styles.inputIcon} />
                        <input
                          type="password"
                          name="password"
                          placeholder="Contraseña"
                          value={credentials.password}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {error && <div className={styles.loginError}>{error}</div>}

                    <button
                      type="submit"
                      className={styles.loginButton}
                      disabled={cargando}
                    >
                      Ingresar
                    </button>
                  </form>

                  {/* <div className={styles.extraLinks}>
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setMode("forgot");
                      }}
                      className={styles.linkButton}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div> */}

                  <div className={styles.microsoftContainer}>
                    <div className={styles.dividerOr}>
                      <span>O continuar con</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleMicrosoftLoginClick}
                      className={styles.loginButtonMicrosoft}
                      disabled={cargando}
                    >
                      <svg
                        className={styles.msIcon}
                        width="16"
                        height="16"
                        viewBox="0 0 23 23"
                      >
                        <path fill="#f35325" d="M0 0h11v11H0z" />
                        <path fill="#81bc06" d="M12 0h11v11H12z" />
                        <path fill="#05a6f0" d="M0 12h11v11H0z" />
                        <path fill="#ffba08" d="M12 12h11v11H12z" />
                      </svg>
                      Cuenta Corporativa Microsoft
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="forgot-form"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <h1 className={styles.loginTitle}>Recuperar Contraseña</h1>
                  <form onSubmit={handleSubmit} noValidate>
                    <div className={styles.loginInputGroup}>
                      <div className={styles.inputIconWrapper}>
                        <FaUserCircle className={styles.inputIcon} />
                        <input
                          type="text"
                          name="login"
                          placeholder="Usuario"
                          value={credentials.login}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {error && <div className={styles.loginError}>{error}</div>}

                    <button
                      type="submit"
                      className={styles.loginButton}
                      disabled={cargando}
                    >
                      Enviar enlace
                    </button>
                  </form>

                  <div className={styles.extraLinks}>
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setMode("login");
                      }}
                      className={styles.backButton}
                    >
                      <FaArrowLeft /> Volver al Login
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <footer className={styles.loginFooter}>
              <ul className={styles.firmaList}>
                <li>
                  <FaPhoneAlt className={styles.icono} /> 669 5778 | Ext 132 -
                  109
                </li>
                <li>
                  <FaEnvelope className={styles.icono} />
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
                  <FaMapMarkerAlt className={styles.icono} /> Oficina Principal,
                  Yumbo - Valle
                </li>
              </ul>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
