import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faLock } from "@fortawesome/free-solid-svg-icons";
import styles from "../../B1/LectorPrecios.module.css";
import logo from "../../../../assets/images/logo.png";

/**
 * Pantalla de login del kiosco. Recibe la contraseña esperada (viene de
 * env vía el orquestador). Al enviar, si la clave es correcta llama
 * `onLoginExitoso` — el orquestador se encarga de activar fullscreen y
 * ocultar el formulario.
 *
 * La contraseña se compara SIN trim: si el env tiene espacios
 * intencionales al final, se respetan. Pero el input bloquea espacios
 * al inicio en tiempo real para evitar errores tontos de escritura.
 */
const LoginKiosco = ({
  contrasenaCorrecta,
  onLoginExitoso,
  onIntentoFallido,
}) => {
  const [contrasena, setContrasena] = useState("");
  const [errorContrasena, setErrorContrasena] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!contrasenaCorrecta) {
      setErrorContrasena(true);
      return;
    }

    if (contrasena === contrasenaCorrecta) {
      setErrorContrasena(false);
      onLoginExitoso();
    } else {
      setErrorContrasena(true);
      setContrasena("");
      onIntentoFallido();
    }
  };

  const handleChange = (e) => {
    // Bloqueo de espacios al inicio (no tiene sentido en contraseña)
    setContrasena(e.target.value.replace(/^\s+/, ""));
    if (errorContrasena) setErrorContrasena(false);
  };

  return (
    <div className={styles.lectorPreciosFormWrapper}>
      <div className={styles.lectorPreciosFormCard}>
        <div className={styles.logoWrapper}>
          <img src={logo} alt="Logo" className={styles.lectorPreciosFormLogo} />
        </div>
        <h2 className={styles.lectorPreciosFormTitle}>Terminal de Consulta</h2>
        <form onSubmit={handleSubmit} className={styles.lectorPreciosForm}>
          <div className={styles.inputWithIcon}>
            <input
              type="password"
              placeholder="Clave de acceso"
              value={contrasena}
              onChange={handleChange}
              className={`${styles.lectorPreciosInput} ${errorContrasena ? styles.inputError : ""}`}
              autoFocus
            />
          </div>
          {errorContrasena && (
            <p className={styles.errorTextMsg}>
              {!contrasenaCorrecta
                ? "El terminal no está configurado"
                : "Credencial incorrecta"}
            </p>
          )}
          <button type="submit" className={styles.lectorPreciosButton}>
            <span>Iniciar Operación</span>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginKiosco;
