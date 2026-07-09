import React from "react";
import styles from "../PrintCanvas.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBarcode, faSlidersH } from "@fortawesome/free-solid-svg-icons";

const TabsBar = ({ activeTab, onChangeTab, tieneAccesoGestion }) => {
  return (
    <div className={styles.tabsContainerCustom}>
      <button
        type="button"
        className={`${styles.tabBtnApple} ${activeTab === "PRINT" ? styles.tabAppleActive : ""}`}
        onClick={() => onChangeTab("PRINT")}
      >
        <FontAwesomeIcon icon={faBarcode} className={styles.iconMargin} />
        Terminal de Impresión
      </button>

      <button
        type="button"
        className={`${styles.tabBtnApple} ${activeTab === "MANAGE" ? styles.tabAppleActive : ""}`}
        disabled={!tieneAccesoGestion}
        onClick={() => {
          if (tieneAccesoGestion) onChangeTab("MANAGE");
        }}
        title={
          !tieneAccesoGestion
            ? "No posee permisos administrativos para gestionar plantillas"
            : undefined
        }
        style={{
          opacity: tieneAccesoGestion ? 1 : 0.5,
          cursor: tieneAccesoGestion ? "pointer" : "not-allowed",
        }}
      >
        <FontAwesomeIcon icon={faSlidersH} className={styles.iconMargin} />
        Gestión de Plantillas
      </button>
    </div>
  );
};

export default TabsBar;
