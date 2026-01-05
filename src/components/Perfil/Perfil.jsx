import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNotification } from "../../contexts/NotificationContext";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import LoadingScreen from "../UI/LoadingScreen";
import styles from "./Perfil.module.css";
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
  faIdCard,
  faBriefcase,
  faLayerGroup,
  faMapMarkerAlt,
  faShieldAlt,
  faCog,
} from "@fortawesome/free-solid-svg-icons";

const Perfil = () => {
  const { user: currentUser } = useAuth();
  const { addNotification } = useNotification();

  const [cargando, setCargando] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [userInfo, setUserInfo] = useState({
    nombres_completos: "",
    login: "",
    correo: "",
    sede: "",
    area: "",
    cargo: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Memoized computed values
  const camposIncompletos = useMemo(() => {
    if (editMode && (userInfo.password || userInfo.confirmPassword)) {
      return (
        !userInfo.nombres_completos?.trim() ||
        !userInfo.correo?.trim() ||
        !!passwordError
      );
    }
    return !userInfo.nombres_completos?.trim() || !userInfo.correo?.trim();
  }, [userInfo, editMode, passwordError]);

  const puedeEditar = useMemo(() => {
    return currentUser && currentUser.id;
  }, [currentUser]);

  // Efectos
  useEffect(() => {
    if (puedeEditar) {
      cargarPerfil();
    }
  }, [puedeEditar]);

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
        special: false,
      });
    }
  }, [userInfo.password]);

  // Funciones principales
  const cargarPerfil = async () => {
    setCargando(true);
    try {
      if (!currentUser?.id) return;

      const data = await apiService.getPerfilUsuario(currentUser.id);
      setUserInfo({
        nombres_completos: data.nombres_completos || "",
        login: data.login || currentUser.login || "",
        correo: data.correo || "",
        sede: data.sede_nombre || data.sede || "",
        area: data.area_nombre || data.area || "",
        cargo: data.cargo_nombre || data.cargo || "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error cargando perfil:", error);
      addNotification({
        message: "Error cargando información del perfil",
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const checkPasswordStrength = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    setPasswordRequirements(requirements);
    const strength = Object.values(requirements).filter(Boolean).length;
    setPasswordStrength(strength);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password" || name === "confirmPassword") {
      validatePasswords(
        name === "password" ? value : userInfo.password,
        name === "confirmPassword" ? value : userInfo.confirmPassword
      );
    }
  };

  const validatePasswords = useCallback((password, confirmPassword) => {
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

    if (password.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres");
      return false;
    }

    setPasswordError("");
    return true;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswords(userInfo.password, userInfo.confirmPassword)) {
      addNotification({
        message: "Por favor corrige los errores en las contraseñas",
        type: "error",
      });
      return;
    }

    if (camposIncompletos) {
      addNotification({
        message: "Por favor complete todos los campos obligatorios",
        type: "error",
      });
      return;
    }

    setCargando(true);
    try {
      const datosParaEnviar = {
        nombres_completos: userInfo.nombres_completos,
        correo: userInfo.correo,
        ...(userInfo.password && { password: userInfo.password }),
      };

      const response = await apiService.updatePerfilUsuario(
        currentUser.id,
        datosParaEnviar
      );

      if (response.success) {
        addNotification({
          message: "Perfil actualizado correctamente",
          type: "success",
        });
        setEditMode(false);
        setUserInfo((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));
        setPasswordStrength(0);
      } else {
        throw new Error(response.message || "Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      addNotification({
        message: error.message || "Error al actualizar el perfil",
        type: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const cancelarEdicion = useCallback(() => {
    setEditMode(false);
    setPasswordError("");
    setUserInfo((prev) => ({
      ...prev,
      password: "",
      confirmPassword: "",
    }));
    setPasswordStrength(0);
    cargarPerfil();
  }, []);

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "#e2e8f0";
    if (passwordStrength <= 1) return "#ef4444";
    if (passwordStrength <= 2) return "#f59e0b";
    if (passwordStrength <= 3) return "#3b82f6";
    if (passwordStrength <= 4) return "#10b981";
    return "#059669";
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return "Sin contraseña";
    if (passwordStrength <= 1) return "Muy débil";
    if (passwordStrength <= 2) return "Débil";
    if (passwordStrength <= 3) return "Regular";
    if (passwordStrength <= 4) return "Fuerte";
    return "Muy fuerte";
  };

  if (cargando && !userInfo.login) {
    return <LoadingScreen message="Cargando información del perfil..." />;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Mi Perfil</h1>
          <p className={styles.subtitle}>
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {/* Profile Overview Card */}
        <div className={styles.profileOverview}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className={styles.userInfo}>
              <h2 className={styles.userName}>
                {userInfo.nombres_completos || "Usuario"}
              </h2>
              <p className={styles.userLogin}>@{userInfo.login}</p>
              <div className={styles.userMeta}>
                <span className={styles.metaItem}>
                  <FontAwesomeIcon icon={faBuilding} />
                  {userInfo.sede || "Sin sede"}
                </span>
                <span className={styles.metaItem}>
                  <FontAwesomeIcon icon={faLayerGroup} />
                  {userInfo.area || "Sin área"}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.profileActions}>
            <div
              className={`${styles.modeIndicator} ${
                editMode ? styles.editMode : styles.viewMode
              }`}
            >
              <FontAwesomeIcon icon={editMode ? faUserEdit : faUser} />
              {editMode ? "Editando" : "Vista"}
            </div>
            <button
              className={styles.editProfileButton}
              onClick={() => setEditMode(!editMode)}
              disabled={!puedeEditar}
            >
              <FontAwesomeIcon icon={editMode ? faTimes : faUserEdit} />
              {editMode ? "Cancelar" : "Editar Perfil"}
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={styles.mainGrid}>
          {/* Información Personal */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <FontAwesomeIcon icon={faUser} className={styles.cardIcon} />
              <h3>Información Personal</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={`${styles.formGroup} ${styles.floating}`}>
                <input
                  type="text"
                  name="nombres_completos"
                  value={userInfo.nombres_completos}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`${styles.formInput} ${
                    !userInfo.nombres_completos && editMode
                      ? styles.inputError
                      : ""
                  }`}
                  placeholder="Ingrese sus nombres completos"
                />
                <label className={styles.formLabel}>
                  <FontAwesomeIcon icon={faIdCard} />
                  Nombres Completos
                </label>
              </div>

              <div className={`${styles.formGroup} ${styles.floating}`}>
                <input
                  type="email"
                  name="correo"
                  value={userInfo.correo}
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`${styles.formInput} ${
                    !userInfo.correo && editMode ? styles.inputError : ""
                  }`}
                  placeholder="usuario@empresa.com"
                />
                <label className={styles.formLabel}>
                  <FontAwesomeIcon icon={faEnvelope} />
                  Correo Electrónico
                </label>
              </div>

              <div className={`${styles.formGroup} ${styles.floating}`}>
                <label className={styles.formLabel}>
                  <FontAwesomeIcon icon={faUser} />
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  value={userInfo.login}
                  disabled={true}
                  className={styles.formInput}
                />
                <div className={styles.formHelp}>
                  El nombre de usuario no se puede modificar
                </div>
              </div>
            </div>
          </div>

          {/* Información Organizacional */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <FontAwesomeIcon icon={faBuilding} className={styles.cardIcon} />
              <h3>Información Organizacional</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.infoGrid}>
                <div className={`${styles.infoItem} ${styles.readOnly}`}>
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className={styles.infoIcon}
                  />
                  <div className={styles.infoContent}>
                    <span className={styles.infoValue}>
                      {userInfo.sede || "No asignada"}
                    </span>
                    <span className={styles.infoLabel}>Sede</span>
                  </div>
                </div>

                <div className={`${styles.infoItem} ${styles.readOnly}`}>
                  <FontAwesomeIcon
                    icon={faLayerGroup}
                    className={styles.infoIcon}
                  />
                  <div className={styles.infoContent}>
                    <span className={styles.infoValue}>
                      {userInfo.area || "No asignada"}
                    </span>
                    <span className={styles.infoLabel}>Área</span>
                  </div>
                </div>

                <div className={`${styles.infoItem} ${styles.readOnly}`}>
                  <FontAwesomeIcon
                    icon={faBriefcase}
                    className={styles.infoIcon}
                  />
                  <div className={styles.infoContent}>
                    <span className={styles.infoValue}>
                      {userInfo.cargo || "No asignado"}
                    </span>
                    <span className={styles.infoLabel}>Cargo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seguridad - Solo en modo edición */}
          {editMode && (
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <FontAwesomeIcon
                  icon={faShieldAlt}
                  className={styles.cardIcon}
                />
                <h3>Seguridad y Contraseña</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <input
                    type="password"
                    name="password"
                    value={userInfo.password}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Ingrese nueva contraseña"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faLock} />
                    Nueva Contraseña
                  </label>
                </div>

                <div className={`${styles.formGroup} ${styles.floating}`}>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={userInfo.confirmPassword}
                    onChange={handleChange}
                    className={`${styles.formInput} ${
                      passwordError ? styles.inputError : ""
                    }`}
                    placeholder="Confirme la nueva contraseña"
                  />
                  <label className={styles.formLabel}>
                    <FontAwesomeIcon icon={faLock} />
                    Confirmar Contraseña
                  </label>
                  {passwordError && (
                    <div className={styles.errorMessage}>
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                      {passwordError}
                    </div>
                  )}
                </div>

                {/* Indicador de Fortaleza */}
                {userInfo.password && (
                  <div className={styles.passwordStrength}>
                    <div className={styles.strengthHeader}>
                      <span>Nivel de seguridad:</span>
                      <strong style={{ color: getPasswordStrengthColor() }}>
                        {getPasswordStrengthLabel()}
                      </strong>
                    </div>

                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${(passwordStrength / 5) * 100}%`,
                          backgroundColor: getPasswordStrengthColor(),
                        }}
                      ></div>
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
                        <span>Mínimo 8 caracteres</span>
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
                        <span>Una mayúscula</span>
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
                        <span>Una minúscula</span>
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
                        <span>Un número</span>
                      </div>
                      <div
                        className={`${styles.requirement} ${
                          passwordRequirements.special ? styles.valid : ""
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={
                            passwordRequirements.special
                              ? faCheckCircle
                              : faExclamationTriangle
                          }
                        />
                        <span>Un carácter especial</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Acciones Principales */}
        {editMode && (
          <div className={styles.actionsCard}>
            <div className={styles.actionsContent}>
              <div className={styles.actionsInfo}>
                <h4>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  Confirmar Cambios
                </h4>
                <p>
                  Revise cuidadosamente la información antes de guardar los
                  cambios
                </p>
              </div>
              <div className={styles.actionsButtons}>
                <button
                  className={styles.cancelButton}
                  onClick={cancelarEdicion}
                  type="button"
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Cancelar
                </button>
                <button
                  className={`${styles.saveButton} ${
                    camposIncompletos ? styles.disabled : ""
                  }`}
                  onClick={handleSubmit}
                  disabled={camposIncompletos || cargando}
                  type="button"
                >
                  <FontAwesomeIcon icon={faSave} />
                  {cargando ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notas Importantes */}
        <div className={styles.importantNote}>
          <div className={styles.noteHeader}>
            <FontAwesomeIcon icon={faCog} />
            <h3>Configuración de la Cuenta</h3>
          </div>
          <div className={styles.notesGrid}>
            <div className={styles.noteItem}>
              <FontAwesomeIcon icon={faShieldAlt} className={styles.noteIcon} />
              <div className={styles.noteContent}>
                <h4>Seguridad</h4>
                <p>
                  Su información está protegida con altos estándares de
                  seguridad
                </p>
              </div>
            </div>
            <div className={styles.noteItem}>
              <FontAwesomeIcon icon={faUser} className={styles.noteIcon} />
              <div className={styles.noteContent}>
                <h4>Privacidad</h4>
                <p>
                  Solo personal autorizado puede ver su información personal
                </p>
              </div>
            </div>
            <div className={styles.noteItem}>
              <FontAwesomeIcon icon={faEnvelope} className={styles.noteIcon} />
              <div className={styles.noteContent}>
                <h4>Comunicaciones</h4>
                <p>
                  Mantenga su correo actualizado para recibir notificaciones
                  importantes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
