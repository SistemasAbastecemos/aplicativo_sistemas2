import React from "react";
import styles from "../PrintCanvas.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle, faHdd } from "@fortawesome/free-solid-svg-icons";

const StatusBar = ({ socketConnected }) => {
  return (
    <div className={styles.statusBarCustom}>
      <div className={styles.agentBadge}>
        <FontAwesomeIcon icon={faHdd} className={styles.iconMargin} />
        <span>Agente Local TSC/Monarch</span>
      </div>
      <div className={styles.statusIndicator}>
        <FontAwesomeIcon
          icon={faCircle}
          className={`${styles.iconStatusCircle} ${socketConnected ? styles.online : styles.offline}`}
        />
        <span className={styles.statusText}>
          {socketConnected ? "Servicio Activo" : "Buscando Agente Local..."}
        </span>
      </div>
    </div>
  );
};

export default React.memo(StatusBar);
