import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faDatabase,
  faUserShield,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../Informes.module.css";
import InformeFormTab from "./InformeFormTab";
import InformePermisosTab from "./InformePermisosTab";

const InformeModal = React.memo(
  ({
    modalOpen,
    modoEdicion,
    activeTab,
    setActiveTab,
    formData,
    onChange,
    areas,
    cargos,
    cargoFilterArea,
    setCargoFilterArea,
    togglePermiso,
    onSave,
    onClose,
  }) => {
    if (!modalOpen) return null;

    return (
      <div className={styles.modalOverlay}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalHeader}>
            <h2>
              {modoEdicion
                ? "Propiedades del Módulo Analítico"
                : "Configurar Nuevo Informe"}
            </h2>
            <button className={styles.modalClose} onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className={styles.tabContainer}>
            <button
              className={`${styles.tab} ${activeTab === "datos" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("datos")}
            >
              <FontAwesomeIcon icon={faDatabase} /> Parámetros Base
            </button>
            <button
              className={`${styles.tab} ${activeTab === "permisos" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("permisos")}
            >
              <FontAwesomeIcon icon={faUserShield} /> Directivas de Acceso
            </button>
          </div>

          <div className={styles.modalBody}>
            {activeTab === "datos" ? (
              <InformeFormTab
                formData={formData}
                onChange={onChange}
                areas={areas}
              />
            ) : (
              <InformePermisosTab
                areas={areas}
                cargos={cargos}
                formData={formData}
                cargoFilterArea={cargoFilterArea}
                setCargoFilterArea={setCargoFilterArea}
                togglePermiso={togglePermiso}
              />
            )}
          </div>

          <div className={styles.modalActions}>
            <button className={styles.cancelButton} onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} /> Cancelar
            </button>
            <button className={styles.saveButton} onClick={onSave}>
              <FontAwesomeIcon icon={faCheck} />{" "}
              {modoEdicion ? "Actualizar Propiedades" : "Registrar Módulo"}
            </button>
          </div>
        </div>
      </div>
    );
  },
);

export default InformeModal;
