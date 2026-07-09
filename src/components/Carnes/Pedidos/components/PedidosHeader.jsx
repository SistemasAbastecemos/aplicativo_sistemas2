import React from "react";
import styles from "../FormularioPedidos.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCow,
  faStore,
  faUser,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";

const PedidosHeader = React.memo(({ user }) => {
  const hoy = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className={styles.headerCanvas}>
      <div className={styles.headerContentWrapper}>
        <div className={styles.titleBlock}>
          <h1>Sistema de Pedidos de Carnes</h1>
          <p className={styles.dateText}>
            <FontAwesomeIcon icon={faCalendarCheck} />{" "}
            {hoy.charAt(0).toUpperCase() + hoy.slice(1)}
          </p>
        </div>

        <div className={styles.userInfoPillsContainer}>
          <span className={styles.userBadge}>
            <FontAwesomeIcon icon={faUser} />{" "}
            {user?.nombres_completos || "Usuario"}
          </span>
          <span className={styles.storeBadge}>
            <FontAwesomeIcon icon={faStore} /> Sede:{" "}
            {user?.sede_codigo || "N/A"}
          </span>
        </div>
      </div>
    </header>
  );
});

PedidosHeader.displayName = "PedidosHeader";
export default PedidosHeader;
