import React from "react";
import styles from "../PrintCanvas.module.css";
import TabsBar from "./TabsBar";

const PrintHeader = ({ activeTab, setActiveTab, tieneAccesoGestion }) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.title}>Estación de Etiquetado e Impresión</h1>
        <p className={styles.subtitle}>
          Generación y despacho de identificadores de inventario en alta
          definición.
        </p>
        {/* Inyección directa con firmas normalizadas */}
        <TabsBar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          tieneAccesoGestion={tieneAccesoGestion}
        />
      </div>
    </header>
  );
};

export default React.memo(PrintHeader);
