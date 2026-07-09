import React from "react";
import styles from "../Usuarios.module.css";

/** Cabecera fija del módulo con título y subtítulo. */
const UsuariosHeader = React.memo(() => (
  <div className={styles.header}>
    <div className={styles.headerContent}>
      <h1 className={styles.title}>Gestión de Usuarios</h1>
      <p className={styles.subtitle}>
        Administra y gestiona los usuarios del sistema
      </p>
    </div>
  </div>
));

UsuariosHeader.displayName = "UsuariosHeader";

export default UsuariosHeader;
