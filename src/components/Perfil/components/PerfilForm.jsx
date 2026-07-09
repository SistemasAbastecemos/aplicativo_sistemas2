import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faIdCard,
  faEnvelope,
  faBuilding,
  faMapMarkerAlt,
  faLayerGroup,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Perfil.module.css";

const PerfilForm = ({ userInfo, editMode, onChange }) => {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleWithIcon}>
          <FontAwesomeIcon icon={faUser} className={styles.headerIcon} />
          <h2>Información Personal</h2>
        </div>
      </div>

      <div className={styles.formGrid}>
        {/* Nombres Completos */}
        <div className={styles.floatingGroup}>
          <div className={styles.inputWrapper}>
            <FontAwesomeIcon icon={faIdCard} className={styles.inputIcon} />
            <input
              type="text"
              name="nombres_completos"
              value={userInfo.nombres_completos || ""}
              onChange={onChange}
              disabled={!editMode}
              placeholder=" "
              className={`${styles.floatingInput} ${
                !userInfo.nombres_completos && editMode ? styles.inputError : ""
              }`}
            />
            <label className={styles.floatingLabel}>Nombres Completos</label>
          </div>
        </div>

        {/* Correo Electrónico */}
        <div className={styles.floatingGroup}>
          <div className={styles.inputWrapper}>
            <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
            <input
              type="email"
              name="correo"
              value={userInfo.correo || ""}
              onChange={onChange}
              disabled={!editMode}
              placeholder=" "
              className={`${styles.floatingInput} ${
                !userInfo.correo && editMode ? styles.inputError : ""
              }`}
            />
            <label className={styles.floatingLabel}>Correo Electrónico</label>
          </div>
        </div>

        {/* Nombre de Usuario */}
        <div className={styles.floatingGroup}>
          <div className={styles.inputWrapper}>
            <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
            <input
              type="text"
              value={userInfo.login || ""}
              disabled={true}
              placeholder=" "
              className={styles.floatingInput}
            />
            <label className={styles.floatingLabel}>
              Nombre de Usuario (Login)
            </label>
          </div>
          <div className={styles.formHelp}>
            El nombre de usuario no se puede modificar
          </div>
        </div>
      </div>

      {/* Sección Organizacional Desacoplada por Clases CSS */}
      <div className={styles.cardHeaderOrganizational}>
        <div className={styles.titleWithIcon}>
          <FontAwesomeIcon icon={faBuilding} className={styles.headerIcon} />
          <h2>Información Organizacional</h2>
        </div>
      </div>

      <div className={styles.formGrid}>
        {/* Sede */}
        <div className={styles.floatingGroup}>
          <div className={styles.inputWrapper}>
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className={styles.inputIcon}
            />
            <input
              type="text"
              value={userInfo.sede || "No asignada"}
              disabled={true}
              placeholder=" "
              className={styles.floatingInput}
            />
            <label className={styles.floatingLabel}>Sede</label>
          </div>
        </div>

        {/* Área */}
        <div className={styles.floatingGroup}>
          <div className={styles.inputWrapper}>
            <FontAwesomeIcon icon={faLayerGroup} className={styles.inputIcon} />
            <input
              type="text"
              value={userInfo.area || "No asignada"}
              disabled={true}
              placeholder=" "
              className={styles.floatingInput}
            />
            <label className={styles.floatingLabel}>Área</label>
          </div>
        </div>

        {/* Cargo */}
        <div className={styles.floatingGroup}>
          <div className={styles.inputWrapper}>
            <FontAwesomeIcon icon={faBriefcase} className={styles.inputIcon} />
            <input
              type="text"
              value={userInfo.cargo || "No asignado"}
              disabled={true}
              placeholder=" "
              className={styles.floatingInput}
            />
            <label className={styles.floatingLabel}>Cargo</label>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PerfilForm;
