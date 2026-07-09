import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import styles from "../Dashboard.module.css";

const SystemNotice = () => (
  <section className={styles.systemCard}>
    <div className={styles.systemContent}>
      <FontAwesomeIcon icon={faBell} className={styles.systemIcon} />
      <div className={styles.systemInfo}>
        <h4>Asignación de Permisos</h4>
        <p>
          Si requieres acceso a nuevos módulos u operaciones de base de datos,
          tramita la solicitud formal con tu jefe de área hacia soporte de TI.
        </p>
      </div>
    </div>
  </section>
);

export default SystemNotice;
