import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faStore } from "@fortawesome/free-solid-svg-icons";
import styles from "../CVM.module.css";

const CVMHeader = ({ user }) => (
  <header className={styles.header}>
    <div className={styles.headerContent}>
      <div className={styles.headerMain}>
        <h1 className={styles.title}>Sistema de Supervisión CVM</h1>
      </div>
      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          <div className={styles.userDetail}>
            <FontAwesomeIcon icon={faUser} />
            <span>{user?.nombres_completos || "Usuario"}</span>
          </div>
          <div className={styles.userDetail}>
            <FontAwesomeIcon icon={faStore} />
            <span>Sede: {user?.sede_codigo || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default CVMHeader;
