import React from "react";
import styles from "../AdministrarItems.module.css";

const ItemsHeader = React.memo(() => (
  <header className={styles.header}>
    <div className={styles.headerContent}>
      <h1>Administración Central de Ítems</h1>
      <p>
        Gobernanza de catálogos operativos y ventanas de asignación semanal
        cronometrada.
      </p>
    </div>
  </header>
));

ItemsHeader.displayName = "ItemsHeader";
export default ItemsHeader;
