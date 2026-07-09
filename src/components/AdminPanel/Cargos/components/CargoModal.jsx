import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import styles from "../Cargos.module.css";
import CargoForm from "./CargoForm";

/**
 * Modal de configuración de cargo. Contenedor delgado: encabezado, cuerpo
 * (delegado en CargoForm) y acciones. El guardado se deshabilita mientras
 * falten campos obligatorios.
 */
const CargoModal = React.memo(
  ({
    modoEdicion,
    formData,
    areas,
    camposIncompletos,
    onChange,
    onSave,
    onClose,
  }) => (
    /* Sin onClick en el overlay: clicar fuera no cierra (cierre solo por X o Cancelar). */
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>
            {modoEdicion ? "Propiedades del Cargo" : "Configurar Nuevo Cargo"}
          </h2>
          <button className={styles.modalClose} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <CargoForm formData={formData} areas={areas} onChange={onChange} />
        </div>

        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} /> Cancelar
          </button>
          <button
            className={`${styles.saveButton} ${camposIncompletos ? styles.disabled : ""}`}
            onClick={onSave}
            disabled={camposIncompletos}
          >
            <FontAwesomeIcon icon={faCheck} />{" "}
            {modoEdicion ? "Actualizar Cargo" : "Registrar Cargo"}
          </button>
        </div>
      </div>
    </div>
  ),
);

CargoModal.displayName = "CargoModal";

export default CargoModal;
