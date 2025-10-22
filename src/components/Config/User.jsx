import React, { useEffect, useState } from "react";
import { useNotification } from "../../contexts/NotificationContext";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import LoadingScreen from "../UI/LoadingScreen";
import styles from "./User.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faTimes,
  faUserEdit,
  faUser,
  faLock,
  faEnvelope,
  faBuilding,
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

export default function Usuario({}) {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [cargando, setCargando] = useState(false);
  const [userInfo, setUserInfo] = useState({
    login: user.login,
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      setCargando(true);
      try {
        if (!user?.id) return;
        const data = await apiService.getUsuario(user.id);
        setUserInfo((prev) => ({
          ...prev,
          nombres_completos: data.nombres_completos,
          sede: data.sede,
          login: data.login,
          correo: data.correo,
        }));
      } catch (error) {
        addNotification({
          message: error.message,
          type: "error",
        });
      } finally {
        setCargando(false);
      }
    };

    fetchUser();
  }, [user?.nit]);

  // Evaluar fortaleza de contraseña
  useEffect(() => {
    if (userInfo.password) {
      checkPasswordStrength(userInfo.password);
    } else {
      setPasswordStrength(0);
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
      });
    }
  }, [userInfo.password]);

  const checkPasswordStrength = (password) => {
    const requirements = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    };

    setPasswordRequirements(requirements);

    const strength = Object.values(requirements).filter(Boolean).length;
    setPasswordStrength(strength);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUserInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));

    const updatedInfo = {
      ...userInfo,
      [name]: value,
    };

    validatePasswords(updatedInfo.password, updatedInfo.confirmPassword);
  };

  const validatePasswords = (password, confirmPassword) => {
    if (!password && !confirmPassword) {
      setPasswordError("");
      return true;
    }

    if (!password || !confirmPassword) {
      setPasswordError("Ambos campos de contraseña son obligatorios");
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return false;
    }

    if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const isValid = validatePasswords(
      userInfo.password,
      userInfo.confirmPassword
    );
    if (!isValid) {
      addNotification({
        message: "Por favor corrige los errores en las contraseñas.",
        type: "error",
      });
      return;
    }

    setCargando(true);

    try {
      const response = await apiService.updateUsuario(user.id, userInfo);

      if (response.success) {
        addNotification({
          message: "Información actualizada correctamente.",
          type: "success",
        });
        setEditMode(false);
        setUserInfo((prev) => ({ ...prev, password: "", confirmPassword: "" }));
        setPasswordStrength(0);
      } else {
        addNotification({
          message: response.message || "Error al actualizar el perfil",
          type: "error",
        });
      }
    } catch (error) {
      addNotification({
        message: error.response?.message || "Error al conectar con el servidor",
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "transparent";
    if (passwordStrength === 1) return "#ff6b6b";
    if (passwordStrength === 2) return "#ffd166";
    if (passwordStrength === 3) return "#06d6a0";
    if (passwordStrength === 4) return "#118ab2";
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength === 1) return "Muy débil";
    if (passwordStrength === 2) return "Débil";
    if (passwordStrength === 3) return "Buena";
    if (passwordStrength === 4) return "Fuerte";
  };

  if (cargando) {
    return <LoadingScreen message="Cargando informacion del usuario..." />;
  }

  return (
    <div className={styles.perfilContainer}>
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.headerRow}>
            <h1 className={styles.title}>
              <FontAwesomeIcon icon={faUser} /> Perfil de Usuario
            </h1>
            <div
              className={`${styles.modeBadge} ${
                editMode ? styles.editMode : styles.viewMode
              }`}
            >
              <FontAwesomeIcon icon={editMode ? faUserEdit : faUser} />
              {editMode ? "Modo Edición" : "Modo Visualización"}
            </div>
          </div>
          <div className={styles.avatarContainer}>
            <div className={styles.avatarCircle}>
              <FontAwesomeIcon icon={faUser} />
            </div>
            {editMode && (
              <button className={styles.avatarEditBtn}>
                <FontAwesomeIcon icon={faUserEdit} />
              </button>
            )}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Login:</span>
              <span className={styles.statusValue}>{userInfo.login}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className={styles.form}>
          <div className={styles.formGroup}>
            <label>
              <FontAwesomeIcon icon={faBuilding} />
              <span>Nombres Completos</span>
            </label>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="nombres_completos"
                value={userInfo.nombres_completos}
                onChange={handleChange}
                disabled={!editMode}
              />
            </div>
            <p className={styles.formHelp}>Este es su nombre completo</p>
          </div>

          <div className={styles.formGroup}>
            <label>
              <FontAwesomeIcon icon={faEnvelope} />
              <span>Sede</span>
            </label>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="sede"
                value={userInfo.sede}
                onChange={handleChange}
                disabled={true}
              />
            </div>
            <p className={styles.formHelp}>
              Esta es la sede a la cual esta amarrado su usuario
            </p>
          </div>

          <div className={styles.formGroup}>
            <label>
              <FontAwesomeIcon icon={faEnvelope} />
              <span>Area</span>
            </label>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="area"
                value={userInfo.area}
                onChange={handleChange}
                disabled={true}
              />
            </div>
            <p className={styles.formHelp}>
              Este es el area asociado a su cuenta
            </p>
          </div>

          <div className={styles.formGroup}>
            <label>
              <FontAwesomeIcon icon={faEnvelope} />
              <span>Cargo</span>
            </label>
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="cargo"
                value={userInfo.cargo}
                onChange={handleChange}
                disabled={true}
              />
            </div>
            <p className={styles.formHelp}>
              Este es el cargo asociado a su cuenta
            </p>
          </div>

          <div className={styles.formGroup}>
            <label>
              <FontAwesomeIcon icon={faEnvelope} />
              <span>Correo Electrónico</span>
            </label>
            <div className={styles.inputGroup}>
              <input
                type="email"
                name="email"
                value={userInfo.correo}
                onChange={handleChange}
                disabled={!editMode}
              />
            </div>
            <p className={styles.formHelp}>
              Este es el correo asociado a su cuenta
            </p>
          </div>

          {editMode && (
            <>
              <div className={styles.formGroup}>
                <label>
                  <FontAwesomeIcon icon={faLock} />
                  <span>Contraseña</span>
                </label>
                <div className={styles.inputGroup}>
                  <input
                    type="password"
                    name="password"
                    placeholder="Nueva contraseña..."
                    value={userInfo.password}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.passwordStrength}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${passwordStrength * 25}%`,
                        backgroundColor: getPasswordStrengthColor(),
                      }}
                    ></div>
                  </div>
                  <div className={styles.strengthInfo}>
                    <span>
                      Seguridad: <strong>{getPasswordStrengthLabel()}</strong>
                    </span>
                    <span>{passwordStrength}/4 requisitos</span>
                  </div>
                </div>

                <div className={styles.passwordRequirements}>
                  <div
                    className={`${styles.requirement} ${
                      passwordRequirements.length ? styles.valid : ""
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={
                        passwordRequirements.length
                          ? faCheckCircle
                          : faExclamationTriangle
                      }
                    />
                    <span>Al menos 6 caracteres</span>
                  </div>
                  <div
                    className={`${styles.requirement} ${
                      passwordRequirements.uppercase ? styles.valid : ""
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={
                        passwordRequirements.uppercase
                          ? faCheckCircle
                          : faExclamationTriangle
                      }
                    />
                    <span>Al menos una mayúscula</span>
                  </div>
                  <div
                    className={`${styles.requirement} ${
                      passwordRequirements.lowercase ? styles.valid : ""
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={
                        passwordRequirements.lowercase
                          ? faCheckCircle
                          : faExclamationTriangle
                      }
                    />
                    <span>Al menos una minúscula</span>
                  </div>
                  <div
                    className={`${styles.requirement} ${
                      passwordRequirements.number ? styles.valid : ""
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={
                        passwordRequirements.number
                          ? faCheckCircle
                          : faExclamationTriangle
                      }
                    />
                    <span>Al menos un número</span>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>
                  <FontAwesomeIcon icon={faLock} />
                  <span>Confirmar Contraseña</span>
                </label>
                <div className={styles.inputGroup}>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirmar nueva contraseña..."
                    value={userInfo.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                {passwordError && (
                  <div className={styles.errorMessage}>{passwordError}</div>
                )}
              </div>
            </>
          )}

          <div className={styles.formActions}>
            {!editMode ? (
              <button
                type="button"
                className={styles.editButton}
                onClick={() => setEditMode(true)}
                disabled={userInfo.nit === ""}
              >
                <FontAwesomeIcon icon={faUserEdit} />
                Editar Perfil
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setEditMode(false);
                    setPasswordError("");
                    setUserInfo((prev) => ({
                      ...prev,
                      password: "",
                      confirmPassword: "",
                    }));
                    setPasswordStrength(0);
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={cargando || !!passwordError}
                >
                  {cargando ? (
                    <span>Cargando...</span>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      <div className={styles.importantNote}>
        <h3>
          <FontAwesomeIcon icon={faExclamationTriangle} />
          Importante
        </h3>
        <ul>
          <li>
            <FontAwesomeIcon icon={faCheckCircle} />
            Su información personal está protegida por nuestras políticas de
            seguridad.
          </li>
          <li>
            <FontAwesomeIcon icon={faCheckCircle} />
            Utilice una contraseña segura que combine letras, números y
            símbolos.
          </li>
          <li>
            <FontAwesomeIcon icon={faCheckCircle} />
            Actualice su correo electrónico si cambia su información de
            contacto.
          </li>
        </ul>
      </div>
    </div>
  );
}
