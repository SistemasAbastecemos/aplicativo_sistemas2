import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { usePerfilForm } from "./hooks/usePerfilForm";

import PerfilHeader from "./components/PerfilHeader";
import PerfilForm from "./components/PerfilForm";
import PerfilSecurity from "./components/PerfilSecurity";
import PerfilGovernance from "./components/PerfilGovernance";

import LoadingScreen from "../UI/LoadingScreen";
import styles from "./Perfil.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faUserEdit,
  faSave,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

const Perfil = () => {
  const { user: currentUser } = useAuth();
  const { addNotification } = useNotification();

  const {
    userInfo,
    cargando,
    editMode,
    passwordError,
    passwordStrength,
    passwordRequirements,
    camposIncompletos,
    puedeEditar,
    setEditMode,
    handleChange,
    cancelarEdicion,
    guardarCambios,
  } = usePerfilForm(currentUser, addNotification);

  if (cargando && !userInfo.login) {
    return (
      <LoadingScreen
        isVisible={true}
        title="Cargando Perfil"
        subtitle="Obteniendo informacion desde el servidor..."
      />
    );
  }

  return (
    <div className={styles.container}>
      {/* 1. Uso correcto del componente especializado */}
      <PerfilHeader
        userInfo={userInfo}
        editMode={editMode}
        puedeEditar={puedeEditar}
        cargando={cargando}
        setEditMode={setEditMode}
        cancelarEdicion={cancelarEdicion}
      />

      <main className={styles.mainContent}>
        {/* 2. El grid se mantiene semántico y limpio aplicando los estilos modulares */}
        <div
          className={
            editMode ? styles.mainGridEditMode : styles.mainGridNormalMode
          }
        >
          <PerfilForm
            userInfo={userInfo}
            editMode={editMode}
            onChange={handleChange}
          />

          {editMode && (
            <PerfilSecurity
              userInfo={userInfo}
              passwordError={passwordError}
              passwordStrength={passwordStrength}
              passwordRequirements={passwordRequirements}
              onChange={handleChange}
            />
          )}
        </div>

        {/* Barra de confirmación inferior interactiva */}
        {editMode && (
          <div className={styles.confirmationFloatBar}>
            <div className={styles.confirmationDetails}>
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className={styles.alertIcon}
              />
              <div>
                <h4 className={styles.confirmationTitle}>Confirmar Cambios</h4>
                <p className={styles.confirmationSubtitle}>
                  Revise cuidadosamente la información antes de guardar los
                  cambios
                </p>
              </div>
            </div>

            <div className={styles.confirmationButtons}>
              <button
                className={styles.cancelActionBtn}
                onClick={cancelarEdicion}
                disabled={cargando}
                type="button"
              >
                Cancelar
              </button>
              <button
                className={`${styles.saveActionBtn} ${camposIncompletos ? styles.btnDisabled : ""}`}
                onClick={guardarCambios}
                disabled={camposIncompletos || cargando}
                type="button"
              >
                <FontAwesomeIcon icon={faSave} />
                <span>{cargando ? "Guardando..." : "Guardar Cambios"}</span>
              </button>
            </div>
          </div>
        )}

        <PerfilGovernance />
      </main>
    </div>
  );
};

export default Perfil;
