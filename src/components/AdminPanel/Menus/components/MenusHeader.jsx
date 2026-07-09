import React from "react";
import styles from "../Menus.module.css";

/** Cabecera fija del módulo con título y subtítulo. */
const MenusHeader = () => (
  <div className={styles.header}>
    <div className={styles.headerContent}>
      <h1 className={styles.title}>Estructura de Navegación</h1>
      <p className={styles.subtitle}>
        Administración jerárquica y asignación de atributos de acceso
      </p>
    </div>
  </div>
);

export default MenusHeader;
