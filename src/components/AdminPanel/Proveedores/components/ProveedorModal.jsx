import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import styles from "../Proveedores.module.css";
import ProveedorForm from "./ProveedorForm";

const ProveedorModal = React.memo(
  ({
    modoEdicion,
    formData,
    confirmarContrasena,
    setConfirmarContrasena,
    errorContrasena,
    camposIncompletos,
    onChange,
    onSave,
    onClose,
  }) => (
    /* Se elimina onClick del overlay para blindaje absoluto contra pérdidas accidentales de datos */
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>
            {modoEdicion
              ? "Propiedades del Proveedor"
              : "Configurar Nuevo Proveedor"}
          </h2>
          <button className={styles.modalClose} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <ProveedorForm
            formData={formData}
            onChange={onChange}
            modoEdicion={modoEdicion}
            confirmarContrasena={confirmarContrasena}
            setConfirmarContrasena={setConfirmarContrasena}
            errorContrasena={errorContrasena}
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
            {modoEdicion ? "Actualizar Proveedor" : "Registrar Aliado"}
          </button>
        </div>
      </div>
    </div>
  ),
);

export default ProveedorModal;
