import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faShieldAlt, faUser } from "@fortawesome/free-solid-svg-icons";
import styles from "../Perfil.module.css";

const PerfilGovernance = () => {
  return (
    <section className={styles.importantNote}>
      <div className={styles.noteHeader}>
        <FontAwesomeIcon icon={faCog} className={styles.noteHeaderIcon} />
        <h3>Gobernanza de Datos Institucionales</h3>
      </div>
      <div className={styles.notesGrid}>
        <div className={styles.noteItem}>
          <FontAwesomeIcon icon={faShieldAlt} className={styles.noteIcon} />
          <div className={styles.noteContent}>
            <h4>Seguridad de Cuenta</h4>
            <p>
              Las modificaciones de contraseña actualizan las credenciales de
              acceso unificado al sistema de inmediato.
            </p>
          </div>
        </div>
        <div className={styles.noteItem}>
          <FontAwesomeIcon icon={faUser} className={styles.noteIcon} />
          <div className={styles.noteContent}>
            <h4>Roles y Atribuciones</h4>
            <p>
              Las sedes, áreas y cargos no son mutables; si registras
              inconsistencias, reporta un ticket al Administrador de Red.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PerfilGovernance;
