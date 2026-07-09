import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShieldAlt,
  faLock,
  faExclamationTriangle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import formStyles from "../Perfil.module.css";

const PerfilSecurity = ({
  userInfo,
  passwordError,
  passwordStrength,
  passwordRequirements,
  onChange,
}) => {
  // Mapeo seguro de colores a través de variables o clases CSS
  const getStrengthColorClass = () => {
    if (passwordStrength === 0) return formStyles.strengthNone;
    if (passwordStrength <= 1) return formStyles.strengthWeak;
    if (passwordStrength <= 2) return formStyles.strengthMedium;
    if (passwordStrength <= 3) return formStyles.strengthRegular;
    if (passwordStrength <= 4) return formStyles.strengthStrong;
    return formStyles.strengthVeryStrong;
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return "Sin contraseña";
    if (passwordStrength <= 1) return "Muy débil";
    if (passwordStrength <= 2) return "Débil";
    if (passwordStrength <= 3) return "Regular";
    if (passwordStrength <= 4) return "Fuerte";
    return "Muy fuerte";
  };

  return (
    <section className={formStyles.card}>
      <div className={formStyles.cardHeader}>
        <div className={formStyles.titleWithIcon}>
          <FontAwesomeIcon
            icon={faShieldAlt}
            className={formStyles.headerIcon}
          />
          <h2>Seguridad y Contraseña</h2>
        </div>
      </div>

      <div className={formStyles.formGrid}>
        {/* Nueva Contraseña */}
        <div className={formStyles.floatingGroup}>
          <div className={formStyles.inputWrapper}>
            <FontAwesomeIcon icon={faLock} className={formStyles.inputIcon} />
            <input
              type="password"
              name="password"
              value={userInfo.password || ""}
              onChange={onChange}
              placeholder=" "
              className={formStyles.floatingInput}
            />
            <label className={formStyles.floatingLabel}>Nueva Contraseña</label>
          </div>
        </div>

        {/* Confirmar Contraseña */}
        <div className={formStyles.floatingGroup}>
          <div className={formStyles.inputWrapper}>
            <FontAwesomeIcon icon={faLock} className={formStyles.inputIcon} />
            <input
              type="password"
              name="confirmPassword"
              value={userInfo.confirmPassword || ""}
              onChange={onChange}
              placeholder=" "
              className={`${formStyles.floatingInput} ${
                passwordError ? formStyles.inputError : ""
              }`}
            />
            <label className={formStyles.floatingLabel}>
              Confirmar Contraseña
            </label>
          </div>
          {passwordError && (
            <div className={formStyles.errorMessage}>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>{passwordError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Indicador de Fortaleza Interactiva en Vivo */}

      <div className={formStyles.strengthContainer}>
        <div className={formStyles.strengthHeader}>
          <span>Nivel de seguridad:</span>
          <strong className={getStrengthColorClass()}>
            {getPasswordStrengthLabel()}
          </strong>
        </div>

        <div className={formStyles.progressBar}>
          <div
            className={`${formStyles.progressFill} ${getStrengthColorClass()}`}
            style={{ width: `${(passwordStrength / 5) * 100}%` }}
          ></div>
        </div>

        <div className={formStyles.requirementsList}>
          <div
            className={`${formStyles.requirement} ${passwordRequirements.length ? formStyles.valid : ""}`}
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
            className={`${formStyles.requirement} ${passwordRequirements.uppercase ? formStyles.valid : ""}`}
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
            className={`${formStyles.requirement} ${passwordRequirements.lowercase ? formStyles.valid : ""}`}
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
            className={`${formStyles.requirement} ${passwordRequirements.number ? formStyles.valid : ""}`}
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
            className={`${formStyles.requirement} ${passwordRequirements.special ? formStyles.valid : ""}`}
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
    </section>
  );
};

export default PerfilSecurity;
