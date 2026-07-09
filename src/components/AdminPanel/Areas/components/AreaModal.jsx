import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import styles from "../Areas.module.css";
import AreaForm from "./AreaForm";

/**
 * Modal de configuración de área. Contenedor delgado: encabezado, cuerpo
 * (delegado en AreaForm) y acciones. El guardado se deshabilita mientras
 * falten campos obligatorios. Al hacer clic fuera del contenido se cierra.
 */
const AreaModal = React.memo(
  ({ modoEdicion, formData, camposIncompletos, onChange, onSave, onClose }) => (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{modoEdicion ? "Editar Área" : "Nueva Área"}</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <AreaForm formData={formData} onChange={onChange} />
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
            {modoEdicion ? "Actualizar" : "Crear"} Área
          </button>
        </div>
      </div>
    </div>
  ),
);

AreaModal.displayName = "AreaModal";

export default AreaModal;
