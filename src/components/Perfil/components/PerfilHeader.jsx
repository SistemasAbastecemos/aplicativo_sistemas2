import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faUser,
  faUserEdit,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Perfil.module.css";

const PerfilHeader = ({
  userInfo,
  editMode,
  puedeEditar,
  cargando,
  setEditMode,
  cancelarEdicion,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.title}>Mi Perfil</h1>
        <span className={styles.subtitle}>Gestión de Identidad de Usuario</span>

        <div className={styles.headerRight}>
          {/* Badge del cargo organizacional */}
          <div className={styles.badgeMeta}>
            <FontAwesomeIcon icon={faBriefcase} />
            <span>{userInfo.cargo || "No asignado"}</span>
          </div>

          {/* Indicador de modo interactivo */}
          <div
            className={`${styles.modeIndicator} ${editMode ? styles.editMode : styles.viewMode}`}
          >
            <FontAwesomeIcon icon={editMode ? faUserEdit : faUser} />
            <span>{editMode ? "Editando" : "Vista"}</span>
          </div>

          {/* Botón de acción principal */}
          <button
            className={styles.editProfileButton}
            onClick={() => {
              if (editMode) cancelarEdicion();
              else setEditMode(true);
            }}
            disabled={!puedeEditar || cargando}
          >
            <FontAwesomeIcon icon={editMode ? faTimes : faUserEdit} />
            <span>{editMode ? "Cancelar" : "Editar Perfil"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default PerfilHeader;
