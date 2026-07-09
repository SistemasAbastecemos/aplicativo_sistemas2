import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import styles from "../Sedes.module.css";
import SedeForm from "./SedeForm";

/**
 * Modal de configuración de sede. Contenedor delgado: encabezado, cuerpo
 * (delegado en SedeForm) y acciones. El guardado se deshabilita mientras
 * falten campos obligatorios.
 */
const SedeModal = React.memo(
  ({ modoEdicion, formData, camposIncompletos, onChange, onSave, onClose }) => (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>
            {modoEdicion ? "Propiedades de la Sede" : "Configurar Nueva Sede"}
          </h2>
          <button className={styles.modalClose} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <SedeForm
            formData={formData}
            modoEdicion={modoEdicion}
            onChange={onChange}
          />
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
            {modoEdicion ? "Actualizar Sede" : "Registrar Sede"}
          </button>
        </div>
      </div>
    </div>
  ),
);

SedeModal.displayName = "SedeModal";

export default SedeModal;
