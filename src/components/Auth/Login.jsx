import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";
import LoadingScreen from "../UI/LoadingScreen";
import {
  FaUserCircle,
  FaUserPlus,
  FaKey,
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/images/logo.png";
import styles from "./Login.module.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    nit: "",
    email: "",
    password: "",
  });
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot
  const { login, error, setError } = useAuth();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
          nit: credentials.nit,
          password: credentials.password,
        });

        if (data.success) {
          navigate("/inicio");
        } else {
          throw new Error(data.message || "Credenciales inválidas");
        }
      }

      if (mode === "register") {
        const data = await apiService.register({
          nit: credentials.nit,
          email: credentials.email,
          password: credentials.password,
        });

        if (data.success) {
          setMode("login");
        } else {
          throw new Error(data.message || "No se pudo registrar");
        }
      }

      if (mode === "forgot") {
        const data = await apiService.forgotPassword({
          nit: credentials.nit,
        });

        if (data.success) {
          alert("Se ha enviado un enlace de recuperación a tu correo.");
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
          whileHover={{ scale: 1.1, color: "#2a8a3a" }}
        />
        <h2 className={styles.panelTitle}>Abastecemos de Occidente S.A.S</h2>
        <p className={styles.panelText}>
          Bienvenid@ a nuestro portal de proveedores de Supermercado Belalcazar.
        </p>
      </div>

      {/* Columna derecha */}
      <div className={styles.rightPanel}>
        <div className={styles.cardWrap}>
          <div className={styles.decorCard} aria-hidden="true" />

          <AnimatePresence mode="wait">
            {mode === "login" && (
              // LOGIN CARD
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
                      type="number"
                      name="nit"
                      placeholder="Nit"
                      value={credentials.nit}
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
                </form>

                {/* Olvide mi contraseña y registrarse */}
                <div className={styles.extraLinks}>
                  <button
                    type="button"
                    className={styles.linkButton}
                    onClick={() => setMode("forgot")}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                  <span>|</span>
                  <button
                    type="button"
                    className={styles.linkButton}
                    onClick={() => setMode("register")}
                  >
                    Registrarse
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
            {mode === "register" && (
              // REGISTER CARD
              <motion.div
                key="register"
                className={styles.loginCard}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.6, type: "spring" }}
                  whileHover={{ scale: 1.1, rotate: 10, color: "#2a8a3a" }}
                  className={styles.registerIcon}
                >
                  <FaUserPlus />
                </motion.div>

                <h2 className={styles.loginTitle}>Crear Cuenta</h2>

                <form onSubmit={handleSubmit} className={styles.loginForm}>
                  <div className={styles.loginInputGroup}>
                    <input
                      type="number"
                      name="nit"
                      placeholder="Nit"
                      value={credentials.nit}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className={styles.loginInputGroup}>
                    <input
                      type="email"
                      name="email"
                      placeholder="Correo electrónico"
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
                  <button type="submit" className={styles.loginButton}>
                    Registrarme
                  </button>
                </form>

                <div className={styles.extraLinks}>
                  <button
                    type="button"
                    className={styles.linkButton}
                    onClick={() => setMode("login")}
                  >
                    ← Volver al Login
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
                      name="nit"
                      placeholder="Nit"
                      value={credentials.nit}
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
                    ← Volver al Login
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
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Login;
